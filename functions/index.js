const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

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