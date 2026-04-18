// ─────────────────────────────────────────────────────────────────────────────
//  NEW SOUND GANG — Firebase Edition
//
//  SETUP INSTRUCTIONS (do these before running):
//
//  1. Go to https://firebase.google.com → "Get Started" → create a project
//     named "new-sound-gang" (or anything you like)
//
//  2. Inside your project dashboard:
//       a. Click "Authentication" → "Get Started" → enable "Email/Password"
//       b. Click "Firestore Database" → "Create database" → start in test mode
//
//  3. Click the gear icon ⚙️ → "Project settings" → scroll to "Your apps"
//     → click the </> Web icon → register app → copy the firebaseConfig object
//
//  4. In your project, install Firebase:
//       npm install firebase
//
//  5. Replace the placeholder values in FIREBASE_CONFIG below with your
//     actual values from step 3.
//
//  6. That’s it — run the app and create your account!
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
updateProfile,
} from "firebase/auth";
import {
getFirestore,
collection,
doc,
setDoc,
getDoc,
getDocs,
addDoc,
deleteDoc,
updateDoc,
onSnapshot,
query,
where,
serverTimestamp,
} from "firebase/firestore"
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ─── 🔥 REPLACE THESE WITH YOUR FIREBASE CONFIG ──────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCt7hUsJDUt2lkkgX911wcdvjKXW9iXH0I",
  authDomain: "cafe-crew-30a55.firebaseapp.com",
  projectId: "cafe-crew-30a55",
  storageBucket: "cafe-crew-30a55.firebasestorage.app",
  messagingSenderId: "987104919432",
  appId: "1:987104919432:web:da3b249fc4feaeac7c443d",
};
// ─────────────────────────────────────────────────────────────────────────────

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp)
const messaging = getMessaging(firebaseApp);

const COFFEE_SHOP = {
name: "New Sound Cafe",
address: "5958 W. Lake St, Chicago, IL",
hours: "7am – 3pm",
wifi: "Psalm40:3",
};

const AVATAR_OPTIONS = ["☕","🎧","📚","🎨","🌿","🧋","🎵","✨","🌙","🔥","🎸","🍵"];
const COLOR_OPTIONS  = ["#e8a87c","#6c9bd1","#a78bfa","#34d399","#f472b6","#c17f3e","#60a5fa","#f87171","#4ade80","#facc15"];
const GROUPS = ["All Friends", "Close Crew", "Study Gang", "Work Pals"];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url(‘https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap’);
:root{–cream:#f5efe6;–warm:#ede0cc;–coffee:#6b4c30;–espresso:#3b2410;–milk:#faf6f0;–steam:#d4c5b0;–accent:#c17f3e;–green:#4a7c59;–rose:#c96b6b;–text:#2a1a0e;–muted:#8b7355;–card:rgba(255,252,248,0.95);–shadow:0 4px 24px rgba(59,36,16,0.10);–shadow-lg:0 12px 48px rgba(59,36,16,0.16);}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:‘DM Sans’,sans-serif;background:var(–cream);color:var(–text);}
.shell{max-width:420px;margin:0 auto;min-height:100vh;background:var(–milk);display:flex;flex-direction:column;box-shadow:0 0 80px rgba(59,36,16,0.12);position:relative;}

/* auth screen */
.auth-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;background:var(–espresso);position:relative;overflow:hidden;}
.auth-screen::before{content:‘☕’;position:absolute;font-size:240px;opacity:0.04;top:-40px;right:-40px;}
.auth-logo{font-family:‘Fraunces’,serif;font-size:32px;font-weight:600;color:var(–warm);letter-spacing:-1px;margin-bottom:6px;text-align:center;}
.auth-logo span{color:var(–accent);font-style:italic;}
.auth-sub{font-size:13px;color:rgba(212,197,176,0.6);margin-bottom:36px;text-align:center;}
.auth-card{background:var(–milk);border-radius:24px;padding:24px;width:100%;max-width:340px;box-shadow:var(–shadow-lg);}
.auth-tabs{display:flex;gap:0;margin-bottom:20px;background:var(–warm);border-radius:12px;padding:3px;}
.auth-tab{flex:1;padding:8px;border:none;background:none;border-radius:10px;font-family:‘DM Sans’,sans-serif;font-size:13px;font-weight:600;color:var(–muted);cursor:pointer;transition:all 0.18s;}
.auth-tab.on{background:var(–espresso);color:var(–warm);}
.auth-title{font-family:‘Fraunces’,serif;font-size:18px;font-weight:600;color:var(–espresso);margin-bottom:16px;}
.fg{margin-bottom:13px;}
.flabel{font-size:10px;font-weight:700;color:var(–muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;display:block;}
.finput{width:100%;background:var(–warm);border:1.5px solid transparent;border-radius:11px;padding:10px 13px;font-family:‘DM Sans’,sans-serif;font-size:14px;color:var(–text);outline:none;transition:border-color 0.18s;}
.finput:focus{border-color:var(–accent);}
.auth-btn{width:100%;background:var(–espresso);color:var(–warm);border:none;border-radius:13px;padding:13px;font-family:‘Fraunces’,serif;font-size:15px;font-weight:600;cursor:pointer;margin-top:4px;transition:all 0.18s;}
.auth-btn:hover{background:var(–coffee);}
.auth-btn:disabled{opacity:0.5;cursor:not-allowed;}
.auth-err{font-size:12px;color:var(–rose);margin-top:8px;text-align:center;}
.avatar-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}
.av-opt{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;border:2.5px solid transparent;transition:all 0.15s;background:var(–warm);}
.av-opt.sel{border-color:var(–accent);transform:scale(1.12);}
.color-grid{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px;}
.col-opt{width:26px;height:26px;border-radius:50%;cursor:pointer;border:2.5px solid transparent;transition:all 0.15s;}
.col-opt.sel{border-color:var(–espresso);transform:scale(1.15);}

/* header */
.hdr{background:var(–espresso);padding:18px 18px 0;position:relative;overflow:hidden;}
.hdr::before{content:’’;position:absolute;inset:0;background:radial-gradient(ellipse at 80% 0%,rgba(193,127,62,0.3) 0%,transparent 60%);}
.hdr-top{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;}
.logo{font-family:‘Fraunces’,serif;font-size:20px;font-weight:600;color:var(–warm);letter-spacing:-0.5px;}
.logo span{color:var(–accent);font-style:italic;}
.hdr-right{display:flex;align-items:center;gap:8px;position:relative;z-index:1;}
.nbtn{position:relative;background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:background 0.2s;}
.nbtn:hover{background:rgba(255,255,255,0.18);}
.nbadge{position:absolute;top:5px;right:5px;background:var(–rose);color:white;font-size:9px;font-weight:700;width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.signout-btn{background:rgba(255,255,255,0.1);border:none;border-radius:20px;padding:5px 10px;color:rgba(212,197,176,0.7);font-size:11px;font-weight:600;cursor:pointer;font-family:‘DM Sans’,sans-serif;transition:all 0.18s;}
.signout-btn:hover{background:rgba(255,255,255,0.18);color:var(–warm);}
.ntabs{display:flex;margin-top:16px;position:relative;z-index:1;}
.ntab{flex:1;background:none;border:none;color:rgba(212,197,176,0.55);font-family:‘DM Sans’,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.4px;text-transform:uppercase;padding:9px 0 12px;cursor:pointer;position:relative;transition:color 0.2s;}
.ntab.on{color:var(–warm);}
.ntab.on::after{content:’’;position:absolute;bottom:0;left:20%;right:20%;height:2px;background:var(–accent);border-radius:2px 2px 0 0;}

/* content */
.content{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;}
.content::-webkit-scrollbar{display:none;}
.card{background:var(–card);border-radius:16px;padding:14px;box-shadow:var(–shadow);}
.stitle{font-family:‘Fraunces’,serif;font-size:14px;font-weight:600;color:var(–espresso);margin-bottom:10px;display:flex;align-items:center;gap:6px;}

/* map */
.mapbox{position:relative;border-radius:16px;overflow:hidden;background:#e8ddd0;height:240px;box-shadow:var(–shadow);}
.mstreet{position:absolute;background:#d4c4af;border-radius:2px;}
.mblock{position:absolute;background:#c9b99f;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:rgba(59,36,16,0.3);font-weight:500;}
.cpin{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;z-index:10;}
.cpinb{background:var(–espresso);color:white;padding:5px 9px;border-radius:20px;font-size:10px;font-family:‘Fraunces’,serif;font-weight:600;white-space:nowrap;box-shadow:0 4px 12px rgba(59,36,16,0.4);display:flex;align-items:center;gap:4px;}
.cpint{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid var(–espresso);margin-top:-1px;}
.fdot{position:absolute;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;z-index:5;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:transform 0.2s;animation:floatin 0.4s ease-out both;}
.fdot:hover{transform:translate(-50%,-50%) scale(1.15);}
@keyframes floatin{from{transform:translate(-50%,-50%) scale(0);opacity:0;}to{transform:translate(-50%,-50%) scale(1);opacity:1;}}
.fdlabel{position:absolute;bottom:-17px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:600;color:var(–espresso);white-space:nowrap;text-shadow:0 1px 2px rgba(255,255,255,0.8);}
.mapfoot{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(232,221,208,0.95));padding:10px 12px 8px;display:flex;align-items:center;justify-content:space-between;}
.livebadge{display:flex;align-items:center;gap:5px;background:var(–espresso);color:var(–warm);font-size:10px;font-weight:600;padding:3px 8px;border-radius:20px;letter-spacing:0.5px;}
.ldot{width:6px;height:6px;background:#4ade80;border-radius:50%;animation:pulse 1.5s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.6;transform:scale(1.3);}}

/* friends */
.frow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(212,197,176,0.4);animation:slideup 0.3s ease-out both;}
.frow:last-child{border-bottom:none;}
@keyframes slideup{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.favatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;position:relative;}
.hring{position:absolute;inset:-3px;border-radius:50%;border:2px solid var(–green);animation:rpulse 2s infinite;}
@keyframes rpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.06);}}
.finfo{flex:1;min-width:0;}
.fname{font-weight:600;font-size:13px;color:var(–espresso);display:flex;align-items:center;gap:5px;}
.htag{font-size:9px;font-weight:700;background:var(–green);color:white;padding:2px 5px;border-radius:8px;letter-spacing:0.4px;text-transform:uppercase;}
.fstatus{font-size:11px;color:var(–muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fgtag{font-size:10px;color:var(–muted);background:var(–warm);padding:2px 7px;border-radius:8px;flex-shrink:0;}
.gpills{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;}
.gpills::-webkit-scrollbar{display:none;}
.gpill{flex-shrink:0;padding:5px 13px;border-radius:20px;font-size:12px;font-weight:500;border:1.5px solid var(–steam);background:none;color:var(–muted);cursor:pointer;transition:all 0.18s;font-family:‘DM Sans’,sans-serif;}
.gpill.on{background:var(–espresso);border-color:var(–espresso);color:var(–warm);}

/* checkin */
.cstrip{background:linear-gradient(135deg,#4a7c59,#3a6348);border-radius:14px;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;color:white;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 16px rgba(74,124,89,0.3);}
.cstrip:hover{transform:translateY(-1px);}
.ctxt{font-size:13px;font-weight:600;}
.csub{font-size:11px;opacity:0.8;margin-top:2px;}
.ccta{background:rgba(255,255,255,0.2);border:none;border-radius:20px;padding:6px 12px;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:‘DM Sans’,sans-serif;}
.spill{display:flex;align-items:center;gap:8px;background:var(–warm);border-radius:12px;padding:9px 13px;}
.sinfo{font-size:11px;color:var(–muted);}

/* polls / rsvp */
.popt{background:var(–warm);border-radius:12px;padding:11px 13px;margin-bottom:7px;cursor:pointer;transition:all 0.18s;border:2px solid transparent;position:relative;overflow:hidden;}
.popt:hover{border-color:var(–accent);}
.popt.voted{border-color:var(–accent);background:rgba(193,127,62,0.12);}
.popt.leading{border-color:var(–green);}
.pfill{position:absolute;top:0;left:0;bottom:0;background:rgba(193,127,62,0.08);border-radius:10px;transition:width 0.6s cubic-bezier(0.34,1.56,0.64,1);}
.prow{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;}
.plabel{font-weight:600;font-size:13px;color:var(–espresso);}
.pavs{display:flex;margin-top:5px;position:relative;z-index:1;}
.pav{width:19px;height:19px;border-radius:50%;background:var(–steam);font-size:10px;display:flex;align-items:center;justify-content:center;border:1.5px solid var(–warm);margin-right:-4px;}
.vbtn{background:var(–espresso);color:var(–warm);border:none;border-radius:20px;font-size:11px;font-weight:600;padding:4px 10px;cursor:pointer;font-family:‘DM Sans’,sans-serif;transition:all 0.18s;position:relative;z-index:1;}
.vbtn:hover{background:var(–coffee);}
.vbtn.voted{background:var(–green);}
.rcard{background:linear-gradient(135deg,var(–espresso),#5a3820);border-radius:18px;padding:16px;color:var(–warm);position:relative;overflow:hidden;}
.rcard::before{content:‘☕’;position:absolute;right:14px;top:10px;font-size:44px;opacity:0.12;}
.rtitle{font-family:‘Fraunces’,serif;font-size:15px;font-weight:600;color:var(–warm);margin-bottom:3px;}
.rsub{font-size:11px;color:rgba(212,197,176,0.7);margin-bottom:12px;}
.rbtns{display:flex;gap:7px;}
.rbtn{flex:1;padding:9px;border-radius:11px;border:none;font-family:‘DM Sans’,sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;justify-content:center;gap:4px;}
.rbtn.yes{background:var(–green);color:white;}
.rbtn.maybe{background:rgba(255,255,255,0.12);color:var(–warm);}
.rbtn.no{background:rgba(201,107,107,0.3);color:#f4a0a0;}
.rbtn:hover{transform:scale(1.03);filter:brightness(1.1);}
.add-poll-btn{width:100%;background:none;border:1.5px dashed var(–steam);border-radius:12px;padding:10px;font-family:‘DM Sans’,sans-serif;font-size:12px;font-weight:600;color:var(–muted);cursor:pointer;margin-top:4px;transition:all 0.18s;}
.add-poll-btn:hover{border-color:var(–accent);color:var(–accent);}

/* notif panel */
.npanel{position:absolute;top:68px;right:14px;width:290px;background:var(–card);border-radius:18px;box-shadow:var(–shadow-lg);z-index:100;overflow:hidden;animation:dropin 0.25s cubic-bezier(0.34,1.56,0.64,1);}
@keyframes dropin{from{opacity:0;transform:translateY(-10px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
.nphdr{padding:12px 14px 9px;border-bottom:1px solid var(–warm);font-family:‘Fraunces’,serif;font-size:13px;font-weight:600;color:var(–espresso);display:flex;justify-content:space-between;align-items:center;}
.npclear{font-family:‘DM Sans’,sans-serif;font-size:11px;color:var(–accent);cursor:pointer;background:none;border:none;}
.nitem{padding:10px 14px;border-bottom:1px solid rgba(212,197,176,0.3);display:flex;gap:9px;align-items:flex-start;}
.nitem.unread{background:rgba(193,127,62,0.06);}
.nicon{font-size:16px;}
.ntxt{font-size:11px;color:var(–text);line-height:1.4;}
.ntime{font-size:10px;color:var(–muted);margin-top:2px;}

/* calendar */
.calhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.calmonth{font-family:‘Fraunces’,serif;font-size:16px;font-weight:600;color:var(–espresso);}
.calnav{background:var(–warm);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;color:var(–espresso);transition:background 0.18s;}
.calnav:hover{background:var(–steam);}
.calgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.caldaylbl{text-align:center;font-size:9px;font-weight:700;color:var(–muted);text-transform:uppercase;letter-spacing:0.4px;padding:3px 0 5px;}
.calday{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:9px;cursor:pointer;transition:all 0.15s;font-size:12px;font-weight:500;color:var(–text);gap:2px;}
.calday:hover{background:var(–warm);}
.calday.today{background:var(–warm);font-weight:700;color:var(–espresso);}
.calday.sel{background:var(–espresso)!important;color:var(–warm)!important;}
.calday.empty{cursor:default;}
.calday.empty:hover{background:none;}
.caldots{display:flex;gap:2px;justify-content:center;}
.caldot{width:5px;height:5px;border-radius:50%;}
.dvhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;}
.dvlabel{font-family:‘Fraunces’,serif;font-size:13px;font-weight:600;color:var(–espresso);}
.avbtn{background:var(–espresso);color:var(–warm);border:none;border-radius:20px;font-size:11px;font-weight:700;padding:4px 11px;cursor:pointer;font-family:‘DM Sans’,sans-serif;transition:all 0.18s;}
.avbtn:hover{background:var(–coffee);}
.vitem{display:flex;align-items:flex-start;gap:9px;padding:9px 0;border-bottom:1px solid rgba(212,197,176,0.35);animation:slideup 0.25s ease-out both;}
.vitem:last-child{border-bottom:none;}
.vtbar{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:34px;}
.vtime{font-size:10px;font-weight:700;color:var(–accent);}
.vline{width:2px;flex:1;min-height:14px;border-radius:2px;background:var(–steam);}
.vavsm{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:2px;}
.vdet{flex:1;}
.vname{font-size:12px;font-weight:600;color:var(–espresso);display:flex;align-items:center;gap:5px;}
.youtag{font-size:9px;background:var(–accent);color:white;padding:2px 5px;border-radius:7px;font-weight:700;}
.vwin{font-size:10px;color:var(–muted);margin-top:1px;}
.vnote{font-size:10px;color:var(–coffee);margin-top:2px;font-style:italic;}
.vdel{background:none;border:none;font-size:13px;cursor:pointer;opacity:0.4;padding:2px 3px;transition:opacity 0.15s;color:var(–rose);}
.vdel:hover{opacity:1;}

/* modal */
.overlay{position:fixed;inset:0;background:rgba(59,36,16,0.45);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:fadein 0.2s;}
@keyframes fadein{from{opacity:0;}to{opacity:1;}}
.modal{background:var(–milk);border-radius:22px 22px 0 0;padding:20px 18px 34px;width:100%;max-width:420px;animation:supm 0.3s cubic-bezier(0.34,1.56,0.64,1);}
@keyframes supm{from{transform:translateY(100%);}to{transform:translateY(0);}}
.mhandle{width:34px;height:4px;background:var(–steam);border-radius:2px;margin:0 auto 18px;}
.mtitle{font-family:‘Fraunces’,serif;font-size:17px;font-weight:600;color:var(–espresso);margin-bottom:16px;}
.frow2{display:flex;gap:9px;}
.frow2 .fg{flex:1;}
.msub{width:100%;background:var(–espresso);color:var(–warm);border:none;border-radius:13px;padding:12px;font-family:‘Fraunces’,serif;font-size:14px;font-weight:600;cursor:pointer;margin-top:5px;transition:all 0.18s;}
.msub:hover{background:var(–coffee);}
.mcancel{width:100%;background:none;border:none;color:var(–muted);font-family:‘DM Sans’,sans-serif;font-size:12px;cursor:pointer;padding:9px;margin-top:3px;}
.emptyday{text-align:center;padding:18px 0 8px;color:var(–muted);font-size:12px;}
.edicon{font-size:26px;margin-bottom:5px;}
.empty-state{text-align:center;padding:24px 0 10px;color:var(–muted);font-size:13px;}
.empty-icon{font-size:32px;margin-bottom:8px;}

/* bottom nav */
.bnav{position:sticky;bottom:0;background:rgba(250,246,240,0.98);backdrop-filter:blur(10px);border-top:1px solid var(–warm);display:flex;padding:7px 0 14px;}
.bbtn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;font-family:‘DM Sans’,sans-serif;font-size:9px;font-weight:600;letter-spacing:0.4px;text-transform:uppercase;color:var(–steam);transition:color 0.18s;padding:3px 0;}
.bbtn.on{color:var(–espresso);}
.bicon{font-size:19px;}

/* toast */
.toast{position:fixed;bottom:85px;left:50%;transform:translateX(-50%);background:var(–espresso);color:var(–warm);padding:9px 18px;border-radius:30px;font-size:12px;font-weight:500;z-index:1000;animation:tin 0.3s cubic-bezier(0.34,1.56,0.64,1),tout 0.3s ease-in 2s both;white-space:nowrap;box-shadow:var(–shadow-lg);}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(10px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
@keyframes tout{to{opacity:0;transform:translateX(-50%) translateY(-10px);}}

/* loading */
.loading{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(–espresso);font-size:32px;animation:spin 1s linear infinite;}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
`;

// ─── Map Component ────────────────────────────────────────────────────────────
function CoffeeMap({ checkedInUsers }) {
// Assign stable map positions based on uid hash
const getPos = (uid) => {
let hash = 0;
for (let c of uid) hash = (hash * 31 + c.charCodeAt(0)) % 1000;
const positions = [
[35,42],[52,58],[68,38],[42,65],[60,48],[38,55],[70,42],[50,35],[45,62],[62,52]
];
return positions[hash % positions.length];
};
return (
<div className="mapbox">
<div style={{position:"absolute",inset:0}}>
<div className="mstreet" style={{top:"39%",left:0,right:0,height:"7%"}}/>
<div className="mstreet" style={{left:"25%",top:0,bottom:0,width:"6%"}}/>
<div className="mstreet" style={{left:"60%",top:0,bottom:0,width:"6%"}}/>
{[{s:{left:"0%",top:"0%",width:"24%",height:"37%"},l:"PARK"},
{s:{left:"31%",top:"0%",width:"27%",height:"31%"},l:""},
{s:{left:"66%",top:"0%",width:"34%",height:"37%"},l:"BLDG"},
{s:{left:"0%",top:"46%",width:"22%",height:"40%"},l:""},
{s:{left:"31%",top:"40%",width:"27%",height:"48%"},l:"CAFÉ ☕"},
{s:{left:"66%",top:"46%",width:"34%",height:"40%"},l:""},
].map((b,i)=><div key={i} className="mblock" style={{...b.s,position:"absolute"}}>{b.l}</div>)}
</div>
<div className="cpin" style={{left:"44%",top:"52%"}}>
<div className="cpinb">☕ New Sound Cafe</div>
<div className="cpint"/>
</div>
{checkedInUsers.map((u,i) => {
const [x,y] = getPos(u.uid);
return (
<div key={u.uid} className="fdot" style={{left:`${x}%`,top:`${y}%`,background:u.color||"#c17f3e",animationDelay:`${i*0.08}s`}}>
{u.avatar||"☕"}
<div className="fdlabel">{u.displayName?.split(" ")[0]||"Friend"}</div>
</div>
);
})}
<div className="mapfoot">
<div className="livebadge"><div className="ldot"/>LIVE</div>
<div style={{fontSize:11,color:"var(–coffee)",fontWeight:500}}>
{checkedInUsers.length} {checkedInUsers.length===1?"person":"people"} here now
</div>
</div>
</div>
);
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────
function CalendarTab({ visits, currentUser, onAddVisit, onDeleteVisit }) {
const today = new Date();
const [viewYear, setViewYear] = useState(today.getFullYear());
const [viewMonth, setViewMonth] = useState(today.getMonth());
const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0,10));
const [showModal, setShowModal] = useState(false);
const [form, setForm] = useState({ start:"09:00", end:"10:00", note:"" });
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const firstDay = new Date(viewYear,viewMonth,1).getDay();
const daysInMonth = new Date(viewYear,viewMonth+1,0).getDate();
const prevM = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
const nextM = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
const ds = (d) => `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const fmt = (t) => { const [h,m]=t.split(":").map(Number); return `${h%12||12}:${String(m).padStart(2,"0")}${h>=12?"pm":"am"}`; };
const selVisits = visits.filter(v=>v.date===selectedDate).sort((a,b)=>a.start.localeCompare(b.start));
const selLabel = () => { const d=new Date(selectedDate+"T12:00:00"); return selectedDate===today.toISOString().slice(0,10)?"Today":d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"}); };
const cells = [];
for(let i=0;i<firstDay;i++) cells.push(null);
for(let d=1;d<=daysInMonth;d++) cells.push(d);
const submit = () => {
if(!form.start||!form.end) return;
onAddVisit({date:selectedDate,start:form.start,end:form.end,note:form.note});
setShowModal(false);
setForm({start:"09:00",end:"10:00",note:""});
};
return (
<>
<div className="card">
<div className="calhdr">
<button className="calnav" onClick={prevM}>‹</button>
<div className="calmonth">{months[viewMonth]} {viewYear}</div>
<button className="calnav" onClick={nextM}>›</button>
</div>
<div className="calgrid">
{dayNames.map(d=><div key={d} className="caldaylbl">{d}</div>)}
{cells.map((day,i)=>{
if(!day) return <div key={`e${i}`} className="calday empty"/>;
const dateStr=ds(day);
const dv=visits.filter(v=>v.date===dateStr);
const isToday=dateStr===today.toISOString().slice(0,10);
const isPast=new Date(dateStr)<new Date(today.toISOString().slice(0,10));
const isSel=dateStr===selectedDate;
return (
<div key={day} className={`calday${isToday?" today":""}${isSel?" sel":""}`}
style={{opacity:isPast&&!isToday?0.4:1}} onClick={()=>setSelectedDate(dateStr)}>
{day}
{dv.length>0&&<div className="caldots">{dv.slice(0,3).map((v,idx)=><div key={idx} className="caldot" style={{background:isSel?"rgba(255,255,255,0.7)":v.color||"var(–accent)"}}/>)}</div>}
</div>
);
})}
</div>
</div>
<div className="card">
<div className="dvhdr">
<div className="dvlabel">☕ {selLabel()}</div>
<button className="avbtn" onClick={()=>setShowModal(true)}>+ Add Visit</button>
</div>
{selVisits.length===0?(
<div className="emptyday"><div className="edicon">🗓️</div><div>No visits planned yet</div><div style={{fontSize:10,marginTop:3,color:"var(–steam)"}}>Be the first!</div></div>
):selVisits.map((v,i)=>(
<div key={v.id} className="vitem" style={{animationDelay:`${i*0.06}s`}}>
<div className="vtbar">
<div className="vtime">{fmt(v.start)}</div>
<div className="vline" style={{background:v.color||"var(–accent)"}}/>
<div className="vtime">{fmt(v.end)}</div>
</div>
<div className="vavsm" style={{background:(v.color||"#c17f3e")+"33"}}>{v.avatar||"😊"}</div>
<div className="vdet">
<div className="vname">{v.displayName}{v.uid===currentUser.uid&&<span className="youtag">YOU</span>}</div>
<div className="vwin">{fmt(v.start)} – {fmt(v.end)}</div>
{v.note&&<div className="vnote">"{v.note}"</div>}
</div>
{v.uid===currentUser.uid&&<button className="vdel" onClick={()=>onDeleteVisit(v.id)}>✕</button>}
</div>
))}
</div>
<div className="card">
<div className="stitle">📆 Coming up</div>
{visits.filter(v=>v.date>=today.toISOString().slice(0,10)).sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)).slice(0,6).map((v,i)=>{
const d=new Date(v.date+"T12:00:00");
const lbl=v.date===today.toISOString().slice(0,10)?"Today":d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
return (
<div key={v.id} className="frow" style={{animationDelay:`${i*0.05}s`}}>
<div style={{width:36,height:36,borderRadius:"50%",background:(v.color||"#c17f3e")+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{v.avatar||"😊"}</div>
<div className="finfo">
<div className="fname">{v.displayName}{v.uid===currentUser.uid&&<span className="youtag">YOU</span>}</div>
<div className="fstatus">{lbl} · {fmt(v.start)}–{fmt(v.end)}</div>
{v.note&&<div style={{fontSize:10,color:"var(–muted)",marginTop:1}}>{v.note}</div>}
</div>
</div>
);
})}
{visits.filter(v=>v.date>=today.toISOString().slice(0,10)).length===0&&(
<div style={{color:"var(–muted)",fontSize:12,padding:"5px 0"}}>No upcoming visits yet!</div>
)}
</div>
{showModal&&(
<div className="overlay" onClick={()=>setShowModal(false)}>
<div className="modal" onClick={e=>e.stopPropagation()}>
<div className="mhandle"/>
<div className="mtitle">Plan your visit ☕</div>
<div className="fg">
<label className="flabel">Date</label>
<input type="date" className="finput" value={selectedDate} min={today.toISOString().slice(0,10)} onChange={e=>setSelectedDate(e.target.value)}/>
</div>
<div className="frow2">
<div className="fg"><label className="flabel">Arriving</label><input type="time" className="finput" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))}/></div>
<div className="fg"><label className="flabel">Leaving</label><input type="time" className="finput" value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/></div>
</div>
<div className="fg">
<label className="flabel">Note (optional)</label>
<input type="text" className="finput" placeholder="Studying, working, just vibing" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} maxLength={60}/>
</div>
<button className="msub" onClick={submit}>Add to Calendar ✓</button>
<button className="mcancel" onClick={()=>setShowModal(false)}>Cancel</button>
</div>
</div>
)}
</>
);
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
const [mode, setMode] = useState("signin");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [displayName, setDisplayName] = useState("");
const [avatar, setAvatar] = useState("☕");
const [color, setColor] = useState("#c17f3e");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async () => {
setError(""); setLoading(true);
try {
if (mode === "signup") {
if (!displayName.trim()) { setError("Please enter your name"); setLoading(false); return; }
const cred = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(cred.user, { displayName: displayName.trim() });
// Save profile to Firestore
await setDoc(doc(db, "users", cred.user.uid), {
uid: cred.user.uid,
displayName: displayName.trim(),
email: email.toLowerCase(),
avatar,
color,
isHere: false,
status: "Just joined! ☕",
group: "All Friends",
createdAt: serverTimestamp(),
});
onAuth(cred.user);
} else {
const cred = await signInWithEmailAndPassword(auth, email, password);
onAuth(cred.user);
}
} catch (e) {
const msgs = {
"auth/email-already-in-use": "That email is already registered.",
"auth/invalid-email": "Please enter a valid email.",
"auth/weak-password": "Password must be at least 6 characters.",
"auth/user-not-found": "No account found with that email.",
"auth/wrong-password": "Incorrect password.",
"auth/invalid-credential": "Incorrect email or password.",
};
setError(msgs[e.code] || "Something went wrong. Try again.");
}
setLoading(false);
};

return (
<div className="auth-screen">
<div className="auth-logo">new sound <span>gang</span></div>
<div className="auth-sub">Your crew’s coffee HQ ☕</div>
<div className="auth-card">
<div className="auth-tabs">
<button className={`auth-tab${mode==="signin"?" on":""}`} onClick={()=>{ setMode("signin"); setError(""); }}>Sign In</button>
<button className={`auth-tab${mode==="signup"?" on":""}`} onClick={()=>{ setMode("signup"); setError(""); }}>Create Account</button>
</div>
{mode==="signup"&&(
<>
<div className="fg">
<label className="flabel">Your Name</label>
<input className="finput" placeholder="What should we call you?" value={displayName} onChange={e=>setDisplayName(e.target.value)}/>
</div>
<div className="fg">
<label className="flabel">Pick an Avatar</label>
<div className="avatar-grid">
{AVATAR_OPTIONS.map(a=><div key={a} className={`av-opt${avatar===a?" sel":""}`} onClick={()=>setAvatar(a)}>{a}</div>)}
</div>
</div>
<div className="fg">
<label className="flabel">Pick a Color</label>
<div className="color-grid">
{COLOR_OPTIONS.map(c=><div key={c} className={`col-opt${color===c?" sel":""}`} style={{background:c}} onClick={()=>setColor(c)}/>)}
</div>
</div>
</>
)}
<div className="fg">
<label className="flabel">Email</label>
<input className="finput" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
</div>
<div className="fg">
<label className="flabel">Password</label>
<input className="finput" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
</div>
{error&&<div className="auth-err">{error}</div>}
<button className="auth-btn" onClick={handleSubmit} disabled={loading}>
{loading?"Loading...": mode==="signup"?"Join the Gang ☕":"Sign In"}
</button>
</div>
</div>
);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
const [authUser, setAuthUser] = useState(undefined); // undefined = loading
const [userProfile, setUserProfile] = useState(null);
const [tab, setTab] = useState("map");
const [allUsers, setAllUsers] = useState([]);
const [checkedInUsers, setCheckedInUsers] = useState([]);
const [polls, setPolls] = useState([]);
const [notifications, setNotifications] = useState([]);
const [visits, setVisits] = useState([]);
const [showNotifs, setShowNotifs] = useState(false);
const [selectedGroup, setSelectedGroup] = useState("All Friends");
const [rsvp, setRsvp] = useState(null);
const [toast, setToast] = useState(null);
const [showPollModal, setShowPollModal] = useState(false);
const [newPollLabel, setNewPollLabel] = useState("");

const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2500); };
const unread = notifications.filter(n=>!n.read).length;

// ── Auth listener ──
useEffect(() => {
const unsub = onAuthStateChanged(auth, async (user) => {
setAuthUser(user || null);
if (user) {
const snap = await getDoc(doc(db, "users", user.uid));
if (snap.exists()) setUserProfile(snap.data());
}
});
return unsub;
}, []);
useEffect(() => {
  if (!authUser) return;
  Notification.requestPermission().then(async (permission) => {
    if (permission === "granted") {
      try {
        const token = await getToken(messaging, {
          vapidKey: "BPW8aki82JxBHWpDtesdb5hOfbRKaePGY-7YgIVLX8iXVk_cVMXJm5EBE07uwoR5VjIpEmx5it01iHPqI0vbxaE"
        });
        if (token) {
          await updateDoc(doc(db, "users", authUser.uid), { fcmToken: token });
        }
      } catch (e) {
        console.log("Notification setup failed", e);
      }
    }
  });
}, [authUser]);

// ── Real-time: all users ──
useEffect(() => {
if (!authUser) return;
const unsub = onSnapshot(collection(db, "users"), (snap) => {
setAllUsers(snap.docs.map(d=>d.data()));
setCheckedInUsers(snap.docs.map(d=>d.data()).filter(u=>u.isHere));
});
return unsub;
}, [authUser]);

// ── Real-time: polls ──
useEffect(() => {
if (!authUser) return;
const unsub = onSnapshot(collection(db, "polls"), (snap) => {
setPolls(snap.docs.map(d=>({id:d.id,...d.data()})));
});
return unsub;
}, [authUser]);

// ── Real-time: visits ──
useEffect(() => {
if (!authUser) return;
const unsub = onSnapshot(collection(db, "visits"), (snap) => {
setVisits(snap.docs.map(d=>({id:d.id,...d.data()})));
});
return unsub;
}, [authUser]);

// ── Real-time: notifications for current user ──
useEffect(() => {
if (!authUser) return;
const q = query(collection(db, "notifications"), where("uid","==",authUser.uid));
const unsub = onSnapshot(q, (snap) => {
setNotifications(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.createdAt?.seconds-a.createdAt?.seconds));
});
return unsub;
}, [authUser]);

const addNotification = async (uid, text, icon) => {
await addDoc(collection(db, "notifications"), {
uid, text, icon, read: false, createdAt: serverTimestamp(),
});
};

// ── Check in / out ──
const handleCheckin = async () => {
if (!userProfile) return;
const isHere = !userProfile.isHere;
await updateDoc(doc(db, "users", authUser.uid), { isHere });
setUserProfile(p=>({...p, isHere}));
if (isHere) {
showToast("📍 Checked in at New Sound Cafe!");
// Notify all other users
for (const u of allUsers) {
  if (u.uid !== authUser.uid) {
    await addNotification(u.uid, `${userProfile.displayName} just arrived at New Sound Cafe!`, "☕");
    if (u.fcmToken) {
      await addDoc(collection(db, "pushQueue"), {
        token: u.fcmToken,
        title: "New Sound Cafe",
        body: `${userProfile.displayName} just arrived! ☕`,
        createdAt: serverTimestamp(),
      });
    }
  }
}
} else {
showToast("👋 Checked out!");
}
};

// ── Vote ──
const handleVote = async (pollId) => {
const poll = polls.find(p=>p.id===pollId);
if (!poll) return;
const votes = poll.votes || [];
const hasVoted = votes.includes(authUser.uid);
const newVotes = hasVoted ? votes.filter(v=>v!==authUser.uid) : [...votes, authUser.uid];
await updateDoc(doc(db, "polls", pollId), { votes: newVotes });
showToast("🗳️ Vote recorded!");
};

// ── RSVP ──
const handleRSVP = async (choice) => {
setRsvp(choice);
showToast({yes:"🎉 You’re going!",maybe:"🤔 Marked as maybe",no:"👋 Declined"}[choice]);
};

// ── Add poll ──
const handleAddPoll = async () => {
if (!newPollLabel.trim()) return;
await addDoc(collection(db, "polls"), {
label: newPollLabel.trim(),
votes: [],
createdBy: authUser.uid,
createdAt: serverTimestamp(),
});
setNewPollLabel("");
setShowPollModal(false);
showToast("📅 Poll added!");
};

// ── Add visit ──
const handleAddVisit = async (v) => {
await addDoc(collection(db, "visits"), {
...v,
uid: authUser.uid,
displayName: userProfile?.displayName || "You",
avatar: userProfile?.avatar || "☕",
color: userProfile?.color || "#c17f3e",
createdAt: serverTimestamp(),
});
showToast("📅 Visit added to calendar!");
};

// ── Delete visit ──
const handleDeleteVisit = async (id) => {
await deleteDoc(doc(db, "visits", id));
showToast("🗑️ Visit removed");
};

// ── Sign out ──
const handleSignOut = async () => {
if (userProfile?.isHere) {
await updateDoc(doc(db, "users", authUser.uid), { isHere: false });
}
await signOut(auth);
};

// ── Clear notifications ──
const clearNotifs = async () => {
for (const n of notifications) {
if (!n.read) await updateDoc(doc(db, "notifications", n.id), { read: true });
}
setShowNotifs(false);
};

const filteredFriends = allUsers.filter(u =>
u.uid !== authUser?.uid &&
(selectedGroup === "All Friends" || u.group === selectedGroup)
);

// Loading state
if (authUser === undefined) return <div className="loading">☕</div>;

// Not signed in
if (!authUser) return (
<>
<style>{css}</style>
<AuthScreen onAuth={(user) => setAuthUser(user)} />
</>
);

return (
<>
<style>{css}</style>
<div className="shell">
{/* Header */}
<div className="hdr">
<div className="hdr-top">
<div className="logo">new sound <span>gang</span></div>
<div className="hdr-right">
<button className="nbtn" onClick={()=>setShowNotifs(v=>!v)}>
🔔{unread>0&&<span className="nbadge">{unread}</span>}
</button>
<button className="signout-btn" onClick={handleSignOut}>Sign out</button>
</div>
</div>
<div className="ntabs">
{[["map","📍 Live"],["friends","👥 Friends"],["meetup","📅 Meetup"],["calendar","🗓️ Plan"]].map(([k,l])=>(
<button key={k} className={`ntab${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</button>
))}
</div>
</div>

```
    {/* Notifications panel */}
    {showNotifs&&(
      <div className="npanel">
        <div className="nphdr">Notifications<button className="npclear" onClick={clearNotifs}>Mark all read</button></div>
        {notifications.length===0&&<div style={{padding:"16px 14px",fontSize:12,color:"var(--muted)"}}>No notifications yet</div>}
        {notifications.slice(0,8).map(n=>(
          <div key={n.id} className={`nitem${n.read?"":" unread"}`}>
            <div className="nicon">{n.icon}</div>
            <div>
              <div className="ntxt">{n.text}</div>
              <div className="ntime">{n.createdAt ? new Date(n.createdAt.seconds*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "just now"}</div>
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="content">

      {/* ── MAP TAB ── */}
      {tab==="map"&&(
        <>
          <CoffeeMap checkedInUsers={checkedInUsers}/>
          <div className="cstrip" onClick={handleCheckin}
            style={userProfile?.isHere?{background:"linear-gradient(135deg,#c96b6b,#a85050)"}:{}}>
            <div>
              <div className="ctxt">{userProfile?.isHere?"✅ You're checked in!":"Are you at New Sound Cafe?"}</div>
              <div className="csub">{userProfile?.isHere?"Tap to check out":"Let friends know you're here"}</div>
            </div>
            <button className="ccta">{userProfile?.isHere?"Check Out":"Check In"}</button>
          </div>
          <div className="spill">
            <span style={{fontSize:20}}>☕</span>
            <div>
              <div style={{fontWeight:600,fontSize:13,color:"var(--espresso)"}}>{COFFEE_SHOP.name}</div>
              <div className="sinfo">{COFFEE_SHOP.address} · {COFFEE_SHOP.hours} · 📶 {COFFEE_SHOP.wifi}</div>
            </div>
          </div>
          <div className="card">
            <div className="stitle">👥 Here right now</div>
            {checkedInUsers.length===0&&<div style={{color:"var(--muted)",fontSize:13,padding:"8px 0"}}>Nobody's here yet — be the first! ☕</div>}
            {checkedInUsers.map(u=>(
              <div key={u.uid} className="frow">
                <div className="favatar" style={{background:(u.color||"#c17f3e")+"33"}}>{u.avatar||"☕"}<div className="hring"/></div>
                <div className="finfo">
                  <div className="fname">{u.displayName}{u.uid===authUser.uid&&<span className="youtag" style={{background:"var(--accent)"}}>YOU</span>}<span className="htag">HERE</span></div>
                  <div className="fstatus">{u.status||""}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── FRIENDS TAB ── */}
      {tab==="friends"&&(
        <>
          <div className="card">
            <div className="stitle">🏷️ Friend Groups</div>
            <div className="gpills">{GROUPS.map(g=><button key={g} className={`gpill${selectedGroup===g?" on":""}`} onClick={()=>setSelectedGroup(g)}>{g}</button>)}</div>
          </div>
          <div className="card">
            <div className="stitle">{filteredFriends.length} member{filteredFriends.length!==1?"s":""}{selectedGroup!=="All Friends"?` in ${selectedGroup}`:""}</div>
            {filteredFriends.length===0&&(
              <div className="empty-state"><div className="empty-icon">👥</div><div>No friends yet — share the app link with your crew!</div></div>
            )}
            {filteredFriends.map((u,i)=>(
              <div key={u.uid} className="frow" style={{animationDelay:`${i*0.05}s`}}>
                <div className="favatar" style={{background:(u.color||"#c17f3e")+"33"}}>{u.avatar||"☕"}{u.isHere&&<div className="hring"/>}</div>
                <div className="finfo">
                  <div className="fname">{u.displayName}{u.isHere&&<span className="htag">HERE</span>}</div>
                  <div className="fstatus">{u.status||""}</div>
                </div>
                <div className="fgtag">{u.group||"All Friends"}</div>
              </div>
            ))}
          </div>
          {/* Your profile card */}
          <div className="card">
            <div className="stitle">👤 Your Profile</div>
            <div className="frow">
              <div className="favatar" style={{background:(userProfile?.color||"#c17f3e")+"33"}}>{userProfile?.avatar||"☕"}{userProfile?.isHere&&<div className="hring"/>}</div>
              <div className="finfo">
                <div className="fname">{userProfile?.displayName} <span style={{fontSize:9,background:"var(--accent)",color:"white",padding:"2px 5px",borderRadius:7,fontWeight:700}}>YOU</span></div>
                <div className="fstatus">{userProfile?.email}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MEETUP TAB ── */}
      {tab==="meetup"&&(
        <>
          <div className="rcard">
            <div className="rtitle">☕ Coffee run this week?</div>
            <div className="rsub">Let the crew know if you're down</div>
            <div className="rbtns">
              {[["yes","✅","I'm in!"],["maybe","🤔","Maybe"],["no","❌","Can't"]].map(([v,icon,label])=>(
                <button key={v} className={`rbtn ${v}${rsvp===v?" selected":""}`} onClick={()=>handleRSVP(v)}>{icon} {label}</button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="stitle">🗳️ Vote on a time</div>
            {polls.length===0&&<div style={{color:"var(--muted)",fontSize:12,padding:"4px 0 8px"}}>No polls yet — add one below!</div>}
            {polls.map(p=>{
              const votes=p.votes||[];
              const voted=votes.includes(authUser.uid);
              const max=Math.max(...polls.map(x=>(x.votes||[]).length),1);
              const lead=votes.length===max&&max>0&&polls.length>1;
              const voterProfiles=votes.slice(0,4).map(uid=>allUsers.find(u=>u.uid===uid));
              return (
                <div key={p.id} className={`popt${voted?" voted":""}${lead?" leading":""}`} onClick={()=>handleVote(p.id)}>
                  <div className="pfill" style={{width:`${(votes.length/max)*100}%`}}/>
                  <div className="prow">
                    <div>
                      <div className="plabel">{p.label}{lead?" 🔥":""}</div>
                      <div className="pavs">{voterProfiles.map((u,i)=>u&&<div key={i} className="pav">{u.avatar||"☕"}</div>)}{votes.length>4&&<div className="pav" style={{fontSize:9}}>+{votes.length-4}</div>}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                      <button className={`vbtn${voted?" voted":""}`} onClick={e=>{e.stopPropagation();handleVote(p.id);}}>{voted?"✓ Voted":"Vote"}</button>
                      <div style={{fontSize:11,color:"var(--muted)"}}>{votes.length} vote{votes.length!==1?"s":""}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <button className="add-poll-btn" onClick={()=>setShowPollModal(true)}>+ Suggest a time</button>
          </div>
          <div className="card">
            <div className="stitle">🎉 Who's in?</div>
            {allUsers.length===0&&<div style={{color:"var(--muted)",fontSize:12,padding:"4px 0"}}>No members yet!</div>}
            {allUsers.map((u,i)=>(
              <div key={u.uid} className="frow" style={{animationDelay:`${i*0.04}s`}}>
                <div className="favatar" style={{background:(u.color||"#c17f3e")+"33"}}>{u.avatar||"☕"}</div>
                <div className="finfo">
                  <div className="fname">{u.displayName}{u.uid===authUser.uid&&<span style={{fontSize:9,background:"var(--accent)",color:"white",padding:"2px 5px",borderRadius:7,fontWeight:700}}>YOU</span>}</div>
                  <div className="fstatus">{u.isHere?"☕ Here now":u.status||""}</div>
                </div>
                <div style={{fontSize:11,fontWeight:600,color:u.isHere?"var(--green)":"var(--muted)",background:u.isHere?"rgba(74,124,89,0.12)":"var(--warm)",padding:"3px 8px",borderRadius:9}}>{u.isHere?"Here ✓":"Not yet"}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CALENDAR TAB ── */}
      {tab==="calendar"&&authUser&&(
        <CalendarTab visits={visits} currentUser={authUser} onAddVisit={handleAddVisit} onDeleteVisit={handleDeleteVisit}/>
      )}
    </div>

    {/* Bottom Nav */}
    <div className="bnav">
      {[["map","📍","Live Map"],["friends","👥","Friends"],["meetup","📅","Meetup"],["calendar","🗓️","Plan"]].map(([k,icon,label])=>(
        <button key={k} className={`bbtn${tab===k?" on":""}`} onClick={()=>setTab(k)}>
          <span className="bicon">{icon}</span>{label}
        </button>
      ))}
    </div>

    {/* Toast */}
    {toast&&<div className="toast">{toast}</div>}

    {/* Add Poll Modal */}
    {showPollModal&&(
      <div className="overlay" onClick={()=>setShowPollModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mhandle"/>
          <div className="mtitle">Suggest a meetup time ☕</div>
          <div className="fg">
            <label className="flabel">Time / Description</label>
            <input className="finput" placeholder="e.g. Saturday 2 PM, Tomorrow morning..." value={newPollLabel} onChange={e=>setNewPollLabel(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAddPoll()}/>
          </div>
          <button className="msub" onClick={handleAddPoll}>Add to Poll ✓</button>
          <button className="mcancel" onClick={()=>setShowPollModal(false)}>Cancel</button>
        </div>
      </div>
    )}
  </div>
</>
);
}