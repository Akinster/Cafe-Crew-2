const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

exports.autoCheckout = functions.pubsub
  .schedule("0 15 * * *")
  .timeZone("America/Chicago")
  .onRun(async () => {
    const db = admin.firestore();
    const snapshot = await db.collection("users").where("isHere", "==", true).get();

    if (snapshot.empty) {
      console.log("Auto-checkout: no users checked in.");
      return null;
    }

    const batch = db.batch();
    const pushPromises = [];

    snapshot.forEach((userDoc) => {
      batch.update(userDoc.ref, { isHere: false });

      const user = userDoc.data();
      if (user.fcmToken) {
        pushPromises.push(
          admin.messaging().send({
            token: user.fcmToken,
            notification: {
              title: "New Sound Cafe",
              body: "You've been automatically checked out — the cafe closes at 3pm! ☕",
            },
            apns: {
              payload: { aps: { sound: "default", badge: 0 } },
            },
          }).catch((e) => console.error("Push failed for", user.uid, e))
        );
      }
    });

    await batch.commit();
    await Promise.all(pushPromises);
    console.log(`Auto-checkout: checked out ${snapshot.size} user(s).`);
    return null;
  });

exports.sendPushNotification = functions.firestore
  .document("pushQueue/{docId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const token = data.token;
    const title = data.title;
    const body = data.body;

    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    try {
      await admin.messaging().send(message);
      await snap.ref.delete();
    } catch (e) {
      console.error("Push failed:", e);
    }
  });