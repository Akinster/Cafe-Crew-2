import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
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
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";
import {
  MapPin, Users, Calendar, CalendarDays, Bell, LogOut,
  Check, ChevronLeft, ChevronRight, X, Pencil, Vote,
  Clock, Wifi, Coffee, Sparkles, Navigation, Camera, Image as ImageIcon, Send,
} from "lucide-react";
import { cn } from "./lib/utils";

const firebaseConfig = {
  apiKey: "AIzaSyCt7hUsJDUt2lkkgX911wcdvjKXW9iXH0I",
  authDomain: "cafe-crew-30a55.firebaseapp.com",
  projectId: "cafe-crew-30a55",
  storageBucket: "cafe-crew-30a55.firebasestorage.app",
  messagingSenderId: "987104919432",
  appId: "1:987104919432:web:da3b249fc4feaeac7c443d",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

let messaging = null;
try {
  messaging = getMessaging(firebaseApp);
} catch {
  console.log("Messaging not supported");
}

const COFFEE_SHOP = {
  name: "New Sound Cafe",
  address: "5958 W. Lake St, Chicago, IL",
  hours: "7am - 3pm",
  wifi: "Psalm40:3",
};

const AVATAR_OPTIONS = ["☕","🎧","📚","🎨","🌿","🧋","🎵","✨","🌙","🔥","🎸","🍵"];
const COLOR_OPTIONS = [
  "#3B82F6","#EF4444","#F59E0B","#10B981","#8B5CF6",
  "#EC4899","#06B6D4","#F97316","#6366F1","#14B8A6",
];
const GROUPS = ["All Friends", "Work Pals"];

// ─── Map Component ────────────────────────────────────────────────────────────
function CoffeeMap({ checkedInUsers }) {
  const getPos = (uid) => {
    let hash = 0;
    for (const c of uid) hash = (hash * 31 + c.charCodeAt(0)) % 1000;
    const positions = [
      [32,45],[50,60],[68,40],[40,68],[58,50],
      [36,58],[72,45],[48,38],[44,65],[64,55],
    ];
    return positions[hash % positions.length];
  };

  return (
    <div className="relative h-56 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-24 w-24 rounded-full bg-blue-200/40 blur-2xl" />
        <div className="absolute right-[15%] top-[40%] h-32 w-32 rounded-full bg-yellow-200/40 blur-2xl" />
        <div className="absolute bottom-[20%] left-[40%] h-20 w-20 rounded-full bg-green-200/40 blur-2xl" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }} />
      <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-lg shadow-foreground/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Coffee className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">New Sound</p>
            <p className="text-[10px] text-muted-foreground">Open now</p>
          </div>
        </div>
        <div className="mt-1 h-3 w-3 rotate-45 bg-white shadow-lg" style={{ marginTop: "-6px" }} />
      </div>
      {checkedInUsers.map((u, i) => {
        const [x, y] = getPos(u.uid);
        return (
          <div key={u.uid} className="animate-bounce-in absolute z-20"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.1}s` }}>
            <div className="relative">
              <div
                className="flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-white text-lg shadow-lg transition-transform hover:scale-110"
                style={{ background: u.color || "#3B82F6" }}
              >
                {u.profilePicUrl ? (
                  <img src={u.profilePicUrl} className="h-full w-full object-cover" alt="" />
                ) : (u.avatar || "☕")}
              </div>
              <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white bg-success" />
            </div>
            <p className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm">
              {u.displayName?.split(" ")[0] || "Friend"}
            </p>
          </div>
        );
      })}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <div className="animate-live-pulse h-2 w-2 rounded-full bg-success" />
          <span className="text-xs font-medium text-foreground">Live</span>
        </div>
        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
          {checkedInUsers.length} {checkedInUsers.length === 1 ? "person" : "people"} here
        </span>
      </div>
    </div>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────
function CalendarTab({ visits, currentUser, onAddVisit, onDeleteVisit }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ start: "09:00", end: "10:00", note: "" });

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["S","M","T","W","T","F","S"];
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevM = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextM = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const ds = (d) => `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const fmt = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`; };
  const selVisits = visits.filter(v => v.date === selectedDate).sort((a, b) => a.start.localeCompare(b.start));
  const selLabel = () => {
    const d = new Date(selectedDate + "T12:00:00");
    return selectedDate === today.toISOString().slice(0, 10)
      ? "Today"
      : d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const submit = () => {
    if (!form.start || !form.end) return;
    onAddVisit({ date: selectedDate, start: form.start, end: form.end, note: form.note });
    setShowModal(false);
    setForm({ start: "09:00", end: "10:00", note: "" });
  };

  return (
    <>
      <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
        <div className="mb-4 flex items-center justify-between">
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all hover:bg-muted active:scale-95" onClick={prevM}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-foreground">{months[viewMonth]} {viewYear}</h3>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all hover:bg-muted active:scale-95" onClick={nextM}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((d, i) => (
            <div key={i} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} className="aspect-square rounded-xl" />;
            const dateStr = ds(day);
            const dv = visits.filter(v => v.date === dateStr);
            const isToday = dateStr === today.toISOString().slice(0, 10);
            const isPast = new Date(dateStr) < new Date(today.toISOString().slice(0, 10));
            const isSel = dateStr === selectedDate;
            return (
              <button key={day}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-medium transition-all",
                  isToday && !isSel && "bg-accent/10 font-semibold text-accent",
                  isSel && "bg-primary text-primary-foreground shadow-md shadow-primary/20",
                  !isToday && !isSel && "hover:bg-secondary",
                  isPast && !isToday && "text-muted-foreground/50"
                )}
                onClick={() => setSelectedDate(dateStr)}
              >
                {day}
                {dv.length > 0 && (
                  <div className="flex gap-0.5">
                    {dv.slice(0, 3).map((v, idx) => (
                      <div key={idx} className="h-1 w-1 rounded-full"
                        style={{ background: isSel ? "rgba(255,255,255,0.7)" : v.color || "var(--accent)" }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100">
              <Coffee className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-foreground">{selLabel()}</h4>
          </div>
          <button className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg active:scale-95"
            onClick={() => setShowModal(true)}>
            + Plan Visit
          </button>
        </div>
        {selVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No visits planned</p>
            <p className="text-xs text-muted-foreground/70">Be the first to drop by!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selVisits.map((v, i) => (
              <div key={v.id} className="animate-slide-up flex items-center gap-3 rounded-2xl bg-secondary/50 p-3"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
                  style={{ background: v.color || "#3B82F6" }}>
                  {v.avatar || "☕"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{v.displayName}</span>
                    {v.uid === currentUser.uid && (
                      <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{fmt(v.start)} - {fmt(v.end)}
                  </div>
                  {v.note && <p className="mt-0.5 text-xs italic text-muted-foreground">{v.note}</p>}
                </div>
                {v.uid === currentUser.uid && (
                  <button className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDeleteVisit(v.id)}>
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <h4 className="font-semibold text-foreground">Coming Up</h4>
        </div>
        <div className="space-y-2">
          {visits
            .filter(v => v.date >= today.toISOString().slice(0, 10))
            .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
            .slice(0, 5)
            .map((v, i) => {
              const d = new Date(v.date + "T12:00:00");
              const lbl = v.date === today.toISOString().slice(0, 10)
                ? "Today"
                : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              return (
                <div key={v.id} className="animate-slide-up flex items-center gap-3 rounded-2xl bg-secondary/50 p-3"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{ background: v.color || "#3B82F6" }}>
                    {v.avatar || "☕"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {v.displayName}
                      {v.uid === currentUser.uid && (
                        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">You</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{lbl} · {fmt(v.start)}</p>
                  </div>
                </div>
              );
            })}
          {visits.filter(v => v.date >= today.toISOString().slice(0, 10)).length === 0 && (
            <p className="py-2 text-center text-sm text-muted-foreground">No upcoming visits</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={() => setShowModal(false)}>
          <div className="animate-slide-up-modal w-full max-w-[420px] rounded-t-[2rem] bg-white px-6 pb-8 pt-4"
            onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-border" />
            <h3 className="mb-6 text-xl font-semibold text-foreground">Plan your visit</h3>
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</label>
              <input type="date"
                className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary"
                value={selectedDate} min={today.toISOString().slice(0, 10)}
                onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div className="mb-4 flex gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arriving</label>
                <input type="time"
                  className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary"
                  value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Leaving</label>
                <input type="time"
                  className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary"
                  value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
              </div>
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note (optional)</label>
              <input type="text"
                className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:ring-2 focus:ring-primary"
                placeholder="Working, studying, just vibing..." value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))} maxLength={60} />
            </div>
            <button className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98]"
              onClick={submit}>
              Add to Calendar
            </button>
            <button className="mt-3 w-full py-2 text-sm font-medium text-muted-foreground" onClick={() => setShowModal(false)}>
              Cancel
            </button>
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
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) { setError("Enter your email first to reset your password."); return; }
    setLoading(true); setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError("Couldn't send reset email. Check your address.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!displayName.trim()) { setError("Please enter your name"); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: displayName.trim() });
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          displayName: displayName.trim(),
          email: email.toLowerCase(),
          avatar, color,
          isHere: false,
          status: "Just joined!",
          group: "All Friends",
          createdAt: serverTimestamp(),
        });
        try {
          const existingSnap = await getDocs(collection(db, "users"));
          const joinPromises = [];
          existingSnap.forEach(existingDoc => {
            const u = existingDoc.data();
            if (u.uid !== cred.user.uid) {
              joinPromises.push(
                addDoc(collection(db, "notifications"), {
                  uid: u.uid,
                  text: `${displayName.trim()} just joined New Sound Gang!`,
                  icon: "🎉",
                  read: false,
                  createdAt: serverTimestamp(),
                })
              );
              if (u.email) {
                joinPromises.push(
                  addDoc(collection(db, "mail"), {
                    to: u.email,
                    message: {
                      subject: "New member joined New Sound Gang!",
                      html: `<p>Hey! <strong>${displayName.trim()}</strong> just joined New Sound Gang. Say hello next time you're at New Sound Cafe! ☕</p>`,
                      text: `Hey! ${displayName.trim()} just joined New Sound Gang. Say hello next time at New Sound Cafe!`,
                    },
                  })
                );
              }
            }
          });
          await Promise.all(joinPromises);
        } catch (e) {
          console.log("Failed to send join notifications", e);
        }
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-yellow-200/50 blur-3xl" />
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
        <Coffee className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-1 text-center text-3xl font-bold text-foreground">
        New Sound <span className="gradient-text">Gang</span>
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Your crew&apos;s coffee HQ</p>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl shadow-foreground/5">
        <div className="mb-6 flex gap-1 rounded-2xl bg-secondary p-1">
          <button className={cn("flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all", mode === "signin" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
            onClick={() => { setMode("signin"); setError(""); }}>Sign In</button>
          <button className={cn("flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all", mode === "signup" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
            onClick={() => { setMode("signup"); setError(""); }}>Create Account</button>
        </div>
        {mode === "signup" && (
          <>
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Name</label>
              <input className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:ring-2 focus:ring-primary"
                placeholder="What should we call you?" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pick an Avatar</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map(a => (
                  <button key={a} className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-lg transition-all", avatar === a && "scale-105 bg-accent/20 ring-2 ring-accent")}
                    onClick={() => setAvatar(a)}>{a}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pick a Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} className={cn("h-8 w-8 rounded-xl transition-all", color === c && "scale-105 ring-2 ring-foreground ring-offset-2")}
                    style={{ background: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
          </>
        )}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
          <input className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:ring-2 focus:ring-primary"
            type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
          <input className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:ring-2 focus:ring-primary"
            type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
        {resetSent && <p className="mb-4 text-center text-sm text-success">Reset email sent! Check your inbox.</p>}
        <button className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl disabled:opacity-50 active:scale-[0.98]"
          onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : mode === "signup" ? "Join the Gang" : "Sign In"}
        </button>
        {mode === "signin" && !resetSent && (
          <button className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleForgotPassword} disabled={loading}>
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser] = useState(undefined);
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
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [groupAssignTarget, setGroupAssignTarget] = useState(null);
  const [newPollDate, setNewPollDate] = useState(new Date().toISOString().slice(0, 10));
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostPhoto, setNewPostPhoto] = useState(null);
  const [newPostPhotoPreview, setNewPostPhotoPreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const photoInputRef = useRef(null);
  const profilePicInputRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const unread = notifications.filter(n => !n.read).length;

  // Auth listener
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

  // FCM token
  useEffect(() => {
    if (!authUser || !messaging) return;
    Notification.requestPermission().then(async (permission) => {
      if (permission === "granted" && messaging) {
        try {
          const token = await getToken(messaging, {
            vapidKey: "BPW8aki82JxBHWpDtesdb5hOfbRKaePGY-7YgIVLX8iXVk_cVMXJm5EBE07uwoR5VjIpEmx5it01iHPqI0vbxaE",
          });
          if (token) await updateDoc(doc(db, "users", authUser.uid), { fcmToken: token });
        } catch (e) {
          console.log("Notification setup failed", e);
        }
      }
    });
  }, [authUser]);

  // Real-time: all users
  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const users = snap.docs.map(d => d.data());
      setAllUsers(users);
      setCheckedInUsers(users.filter(u => u.isHere));
      const me = users.find(u => u.uid === authUser.uid);
      if (me) setUserProfile(me);
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      snap.docs.forEach(d => {
        const u = d.data();
        if (u.status === "Just joined!" && u.createdAt?.seconds * 1000 < cutoff) {
          updateDoc(doc(db, "users", u.uid), { status: "" }).catch(console.error);
        }
      });
    });
    return unsub;
  }, [authUser]);

  // Real-time: polls — auto-delete expired
  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(collection(db, "polls"), (snap) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const expired = snap.docs.filter(d => {
        const p = d.data();
        return p.date && p.date < todayStr;
      });
      if (expired.length > 0) {
        expired.forEach(d => deleteDoc(doc(db, "polls", d.id)).catch(console.error));
      }
      setPolls(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => !p.date || p.date >= todayStr)
      );
    });
    return unsub;
  }, [authUser]);

  // Real-time: visits
  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(collection(db, "visits"), (snap) => {
      setVisits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [authUser]);

  // Real-time: notifications
  useEffect(() => {
    if (!authUser) return;
    const q = query(collection(db, "notifications"), where("uid", "==", authUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
    });
    return unsub;
  }, [authUser]);

  // Real-time: posts feed
  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30)),
      snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [authUser]);

  // Auto checkout at 3pm Chicago time
  useEffect(() => {
    if (!authUser || !userProfile) return;
    const checkTime = () => {
      const chicagoStr = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
      const hour = new Date(chicagoStr).getHours();
      if (hour >= 15 && userProfile.isHere) {
        updateDoc(doc(db, "users", authUser.uid), { isHere: false });
        setUserProfile(p => p ? { ...p, isHere: false } : null);
        showToast("Auto checked out — cafe closes at 3pm!");
      }
    };
    checkTime();
    const iv = setInterval(checkTime, 60000);
    return () => clearInterval(iv);
  }, [authUser, userProfile?.isHere]);

  const addNotification = async (uid, text, icon) => {
    await addDoc(collection(db, "notifications"), { uid, text, icon, read: false, createdAt: serverTimestamp() });
  };

  // Check in/out
  const handleCheckin = async () => {
    if (!userProfile || !authUser) return;
    const isHere = !userProfile.isHere;
    await updateDoc(doc(db, "users", authUser.uid), { isHere });
    setUserProfile(p => p ? { ...p, isHere } : null);
    if (isHere) {
      showToast("Checked in at New Sound Cafe!");
      for (const u of allUsers) {
        if (u.uid !== authUser.uid) {
          await addNotification(u.uid, `${userProfile.displayName} just arrived at New Sound Cafe!`, "☕");
          if (u.fcmToken) {
            await addDoc(collection(db, "pushQueue"), { token: u.fcmToken, title: "New Sound Cafe", body: `${userProfile.displayName} just arrived!`, createdAt: serverTimestamp() });
          }
          if (u.email) {
            await addDoc(collection(db, "mail"), {
              to: u.email,
              message: {
                subject: `${userProfile.displayName} just checked in at New Sound!`,
                html: `<p><strong>${userProfile.displayName}</strong> just checked in at New Sound Cafe. Head over! ☕</p>`,
                text: `${userProfile.displayName} just checked in at New Sound Cafe. Head over!`,
              },
            });
          }
        }
      }
    } else {
      showToast("Checked out!");
      for (const u of allUsers) {
        if (u.uid !== authUser.uid) {
          await addNotification(u.uid, `${userProfile.displayName} just left New Sound Cafe.`, "👋");
          if (u.fcmToken) {
            await addDoc(collection(db, "pushQueue"), { token: u.fcmToken, title: "New Sound Cafe", body: `${userProfile.displayName} just left.`, createdAt: serverTimestamp() });
          }
        }
      }
    }
  };

  // Vote
  const handleVote = async (pollId) => {
    if (!authUser) return;
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    const votes = poll.votes || [];
    const hasVoted = votes.includes(authUser.uid);
    const newVotes = hasVoted ? votes.filter(v => v !== authUser.uid) : [...votes, authUser.uid];
    await updateDoc(doc(db, "polls", pollId), { votes: newVotes });
    showToast("Vote recorded!");
  };

  // RSVP
  const handleRSVP = (choice) => {
    setRsvp(choice);
    showToast({ yes: "You're going!", maybe: "Marked as maybe", no: "Declined" }[choice]);
  };

  // Add poll
  const handleAddPoll = async () => {
    if (!newPollLabel.trim() || !authUser || !userProfile) return;
    const label = newPollLabel.trim();
    await addDoc(collection(db, "polls"), { label, date: newPollDate, votes: [], createdBy: authUser.uid, createdAt: serverTimestamp() });
    for (const u of allUsers) {
      if (u.uid !== authUser.uid) {
        await addNotification(u.uid, `${userProfile.displayName} suggested a meetup: "${label}"`, "🗳️");
        if (u.fcmToken) {
          await addDoc(collection(db, "pushQueue"), { token: u.fcmToken, title: "New meetup time suggested!", body: `${userProfile.displayName}: "${label}"`, createdAt: serverTimestamp() });
        }
        if (u.email) {
          await addDoc(collection(db, "mail"), {
            to: u.email,
            message: {
              subject: "New meetup time suggested!",
              html: `<p><strong>${userProfile.displayName}</strong> suggested a meetup time: <strong>${label}</strong> on <strong>${newPollDate}</strong>. Head to New Sound Gang to vote!</p>`,
              text: `${userProfile.displayName} suggested a meetup time: ${label} on ${newPollDate}. Head to New Sound Gang to vote!`,
            },
          });
        }
      }
    }
    setNewPollLabel("");
    setNewPollDate(new Date().toISOString().slice(0, 10));
    setShowPollModal(false);
    showToast("Poll added!");
  };

  // Add visit
  const handleAddVisit = async (v) => {
    if (!authUser || !userProfile) return;
    await addDoc(collection(db, "visits"), {
      ...v, uid: authUser.uid,
      displayName: userProfile.displayName || "You",
      avatar: userProfile.avatar || "☕",
      color: userProfile.color || "#3B82F6",
      createdAt: serverTimestamp(),
    });
    const fmtT = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`; };
    const name = userProfile.displayName || "Someone";
    for (const u of allUsers) {
      if (u.uid !== authUser.uid) {
        await addNotification(u.uid, `${name} is planning a visit on ${v.date} at ${fmtT(v.start)}`, "🗓️");
        if (u.fcmToken) {
          await addDoc(collection(db, "pushQueue"), { token: u.fcmToken, title: "New visit planned!", body: `${name} will be at the cafe on ${v.date}`, createdAt: serverTimestamp() });
        }
        if (u.email) {
          await addDoc(collection(db, "mail"), {
            to: u.email,
            message: {
              subject: `${name} is planning a cafe visit!`,
              html: `<p><strong>${name}</strong> is planning a visit to New Sound Cafe on <strong>${v.date}</strong> at <strong>${fmtT(v.start)}</strong>. Join them! ☕</p>`,
              text: `${name} is planning a visit to New Sound Cafe on ${v.date} at ${fmtT(v.start)}. Join them!`,
            },
          });
        }
      }
    }
    showToast("Visit added to calendar!");
  };

  // Delete visit
  const handleDeleteVisit = async (id) => {
    await deleteDoc(doc(db, "visits", id));
    showToast("Visit removed");
  };

  // Add post
  const handleAddPost = async () => {
    if ((!newPostText.trim() && !newPostPhoto) || posting) return;
    setPosting(true);
    try {
      let photoUrl = null;
      if (newPostPhoto) {
        const storageRef = ref(storage, `posts/${authUser.uid}/${Date.now()}`);
        await uploadBytes(storageRef, newPostPhoto);
        photoUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "posts"), {
        text: newPostText.trim(),
        photoUrl,
        uid: authUser.uid,
        displayName: userProfile?.displayName || "Friend",
        avatar: userProfile?.avatar || "☕",
        color: userProfile?.color || "#3B82F6",
        profilePicUrl: userProfile?.profilePicUrl || null,
        createdAt: serverTimestamp(),
      });
      setNewPostText("");
      setNewPostPhoto(null);
      setNewPostPhotoPreview(null);
    } catch {
      showToast("Couldn't post. Try again.");
    }
    setPosting(false);
  };

  // Upload profile picture
  const handleUploadProfilePic = async (file) => {
    if (!file || !authUser) return;
    setProfilePicUploading(true);
    try {
      const storageRef = ref(storage, `profilePics/${authUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", authUser.uid), { profilePicUrl: url });
      setUserProfile(p => p ? { ...p, profilePicUrl: url } : null);
      showToast("Profile picture updated!");
    } catch {
      showToast("Couldn't upload photo.");
    }
    setProfilePicUploading(false);
  };

  // Sign out
  const handleSignOut = async () => {
    if (userProfile?.isHere && authUser) {
      await updateDoc(doc(db, "users", authUser.uid), { isHere: false });
    }
    await signOut(auth);
  };

  // Update username
  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || !authUser) return;
    const name = newUsername.trim();
    await updateProfile(auth.currentUser, { displayName: name });
    await updateDoc(doc(db, "users", authUser.uid), { displayName: name });
    setUserProfile(p => p ? { ...p, displayName: name } : null);
    setEditingUsername(false);
    showToast("Username updated!");
  };

  // Assign friend to group
  const handleAssignGroup = async (friendUid, group) => {
    if (!authUser || !userProfile) return;
    const updated = { ...(userProfile.friendGroups || {}), [friendUid]: group };
    await updateDoc(doc(db, "users", authUser.uid), { friendGroups: updated });
    setUserProfile(p => p ? { ...p, friendGroups: updated } : null);
    setGroupAssignTarget(null);
    showToast(`Moved to ${group}`);
  };

  // Clear notifications
  const clearNotifs = async () => {
    for (const n of notifications) {
      if (!n.read) await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
    setShowNotifs(false);
  };

  const myFriendGroups = userProfile?.friendGroups || {};
  const filteredFriends = allUsers.filter(
    u => u.uid !== authUser?.uid && (selectedGroup === "All Friends" || myFriendGroups[u.uid] === selectedGroup)
  );

  if (authUser === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400">
          <Coffee className="h-8 w-8 text-white" />
        </div>
      </div>
    );

  if (!authUser) return <AuthScreen onAuth={(user) => setAuthUser(user)} />;

  const tabs = [
    { key: "map", icon: Navigation, label: "Live" },
    { key: "friends", icon: Users, label: "Friends" },
    { key: "meetup", icon: Calendar, label: "Meetup" },
    { key: "calendar", icon: CalendarDays, label: "Plan" },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/20">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">New Sound Gang</h1>
              <p className="text-xs text-muted-foreground">{checkedInUsers.length} people here now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground transition-all hover:bg-muted active:scale-95"
              onClick={() => setShowNotifs(v => !v)}>
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
              onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications panel */}
      {showNotifs && (
        <div className="animate-slide-up absolute right-4 top-20 z-50 w-80 overflow-hidden rounded-3xl bg-white shadow-2xl shadow-foreground/10">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <span className="font-semibold text-foreground">Notifications</span>
            <button className="text-sm font-medium text-accent transition-colors hover:text-accent/80" onClick={clearNotifs}>
              Mark all read
            </button>
          </div>
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 8).map(n => (
              <div key={n.id} className={cn("flex gap-3 border-b border-border/30 px-5 py-3", !n.read && "bg-accent/5")}>
                <span className="text-xl">{n.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-foreground">{n.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "just now"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav className="sticky top-[72px] z-20 bg-white/80 px-4 pb-3 backdrop-blur-xl">
        <div className="flex gap-1 rounded-2xl bg-secondary p-1">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button key={key}
              className={cn("flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 transition-all", tab === key ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setTab(key)}>
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="hide-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">

        {/* MAP TAB */}
        {tab === "map" && (
          <>
            <CoffeeMap checkedInUsers={checkedInUsers} />
            <button
              className={cn("flex items-center justify-between rounded-3xl p-4 text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]",
                userProfile?.isHere ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-emerald-400")}
              onClick={handleCheckin}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  {userProfile?.isHere ? <Check className="h-6 w-6" /> : <MapPin className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-base font-semibold">{userProfile?.isHere ? "You're here!" : "Check in"}</p>
                  <p className="text-sm opacity-80">{userProfile?.isHere ? "Tap to check out" : "Let friends know you arrived"}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 opacity-60" />
            </button>
            {/* Post composer */}
            <div className="rounded-3xl bg-white p-4 shadow-sm shadow-foreground/5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-base"
                  style={{ background: userProfile?.color || "#3B82F6" }}>
                  {userProfile?.profilePicUrl ? (
                    <img src={userProfile.profilePicUrl} className="h-full w-full object-cover" alt="" />
                  ) : (userProfile?.avatar || "☕")}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    className="w-full resize-none rounded-2xl border-0 bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    placeholder="Share a moment at New Sound..."
                    value={newPostText}
                    onChange={e => setNewPostText(e.target.value)}
                    maxLength={300}
                  />
                  {newPostPhotoPreview && (
                    <div className="relative mt-2 overflow-hidden rounded-2xl">
                      <img src={newPostPhotoPreview} className="max-h-48 w-full object-cover" alt="" />
                      <button
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/60 text-white"
                        onClick={() => { setNewPostPhoto(null); setNewPostPhotoPreview(null); }}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                      onClick={() => photoInputRef.current?.click()}>
                      <ImageIcon className="h-4 w-4" /> Photo
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setNewPostPhoto(file);
                        const reader = new FileReader();
                        reader.onload = ev => setNewPostPhotoPreview(ev.target.result);
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }} />
                    <button
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 disabled:opacity-50"
                      onClick={handleAddPost}
                      disabled={posting || (!newPostText.trim() && !newPostPhoto)}>
                      <Send className="h-3.5 w-3.5" />{posting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm shadow-foreground/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <Coffee className="h-7 w-7 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{COFFEE_SHOP.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {COFFEE_SHOP.address}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {COFFEE_SHOP.hours}</span>
                  <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> {COFFEE_SHOP.wifi}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground">Here right now</h3>
              </div>
              {checkedInUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Nobody&apos;s here yet</p>
                  <p className="text-xs text-muted-foreground/70">Be the first to check in!</p>
                </div>
              )}
              <div className="space-y-2">
                {checkedInUsers.map((u, i) => (
                  <div key={u.uid} className="animate-slide-up flex items-center gap-3 rounded-2xl bg-secondary/50 p-3"
                    style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl text-lg" style={{ background: u.color || "#3B82F6" }}>
                        {u.profilePicUrl ? (
                          <img src={u.profilePicUrl} className="h-full w-full object-cover" alt="" />
                        ) : (u.avatar || "☕")}
                      </div>
                      <div className="animate-pulse-ring absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{u.displayName}</span>
                        {u.uid === authUser.uid && <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">You</span>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{u.status || "Hanging out"}</p>
                    </div>
                    <span className="rounded-xl bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">Here</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts feed */}
            {posts.length > 0 && (
              <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100">
                    <ImageIcon className="h-5 w-5 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Gang Feed</h3>
                </div>
                <div className="space-y-4">
                  {posts.map((post, i) => {
                    const ts = post.createdAt?.seconds
                      ? new Date(post.createdAt.seconds * 1000).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "just now";
                    return (
                      <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                        <div className="mb-2 flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl text-base"
                            style={{ background: post.color || "#3B82F6" }}>
                            {post.profilePicUrl ? (
                              <img src={post.profilePicUrl} className="h-full w-full object-cover" alt="" />
                            ) : (post.avatar || "☕")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-none text-foreground">{post.displayName}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">{ts}</p>
                          </div>
                        </div>
                        {post.text && <p className="mb-2 text-sm leading-relaxed text-foreground">{post.text}</p>}
                        {post.photoUrl && (
                          <div className="overflow-hidden rounded-2xl">
                            <img src={post.photoUrl} className="max-h-72 w-full object-cover" alt="" loading="lazy" />
                          </div>
                        )}
                        {i < posts.length - 1 && <div className="mt-4 border-b border-border/40" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* FRIENDS TAB */}
        {tab === "friends" && (
          <>
            <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-foreground">Friend Groups</h3>
              </div>
              <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                {GROUPS.map(g => (
                  <button key={g}
                    className={cn("shrink-0 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                      selectedGroup === g ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary text-muted-foreground hover:bg-muted")}
                    onClick={() => setSelectedGroup(g)}>{g}</button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
              <h3 className="mb-4 font-semibold text-foreground">
                {filteredFriends.length} member{filteredFriends.length !== 1 ? "s" : ""}
                {selectedGroup !== "All Friends" ? ` in ${selectedGroup}` : ""}
              </h3>
              {filteredFriends.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No friends yet</p>
                  <p className="text-xs text-muted-foreground/70">Share the app with your crew!</p>
                </div>
              )}
              <div className="space-y-2">
                {filteredFriends.map((u, i) => (
                  <div key={u.uid} className="animate-slide-up flex items-center gap-3 rounded-2xl bg-secondary/50 p-3"
                    style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg" style={{ background: u.color || "#3B82F6" }}>
                        {u.avatar || "☕"}
                      </div>
                      {u.isHere && <div className="animate-pulse-ring absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{u.displayName}</span>
                        {u.isHere && <span className="rounded-lg bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">Here</span>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{u.status || ""}</p>
                    </div>
                    <button className="shrink-0 rounded-xl bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                      onClick={() => setGroupAssignTarget(u.uid)}>
                      {myFriendGroups[u.uid] || "Group"} <Pencil className="ml-1 inline-block h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Your profile card */}
            <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-100">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-foreground">Your Profile</h3>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-xl" style={{ background: userProfile?.color || "#4ECDC4" }}>
                    {userProfile?.profilePicUrl ? (
                      <img src={userProfile.profilePicUrl} className="h-full w-full object-cover" alt="" />
                    ) : (userProfile?.avatar || "☕")}
                  </div>
                  <button
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm disabled:opacity-60"
                    onClick={() => profilePicInputRef.current?.click()}
                    disabled={profilePicUploading}
                    title="Change profile picture">
                    {profilePicUploading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Camera className="h-3 w-3 text-white" />
                    )}
                  </button>
                  <input ref={profilePicInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadProfilePic(f); e.target.value = ""; }} />
                  {userProfile?.isHere && <div className="animate-pulse-ring absolute -top-0.5 -left-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-success" />}
                </div>
                <div className="min-w-0 flex-1">
                  {editingUsername ? (
                    <div className="flex items-center gap-2">
                      <input className="flex-1 rounded-xl border-0 bg-white px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                        value={newUsername} onChange={e => setNewUsername(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleUpdateUsername()} autoFocus maxLength={30} />
                      <button className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground" onClick={handleUpdateUsername}>Save</button>
                      <button className="p-2 text-muted-foreground" onClick={() => setEditingUsername(false)}><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{userProfile?.displayName}</span>
                      <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">You</span>
                      <button className="text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => { setNewUsername(userProfile?.displayName || ""); setEditingUsername(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="truncate text-xs text-muted-foreground">{userProfile?.email}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MEETUP TAB */}
        {tab === "meetup" && (
          <>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-5 text-white shadow-lg shadow-blue-500/20">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <h3 className="text-xl font-bold">Coffee run this week?</h3>
                <p className="mb-5 mt-1 text-sm opacity-80">Let the crew know if you&apos;re down</p>
                <div className="flex gap-2">
                  {[
                    { key: "yes", label: "I'm in!", bg: "bg-white text-green-600" },
                    { key: "maybe", label: "Maybe", bg: "bg-white/20 text-white" },
                    { key: "no", label: "Can't", bg: "bg-white/10 text-white/80" },
                  ].map(({ key, label, bg }) => (
                    <button key={key}
                      className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition-all active:scale-95", bg, rsvp === key && "ring-2 ring-white ring-offset-2 ring-offset-blue-500")}
                      onClick={() => handleRSVP(key)}>
                      {key === "yes" && <Check className="h-4 w-4" />}{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100">
                  <Vote className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-foreground">Vote on a time</h3>
              </div>
              {polls.length === 0 && <p className="mb-4 text-sm text-muted-foreground">No polls yet — add one below!</p>}
              <div className="space-y-2">
                {polls.map(p => {
                  const votes = p.votes || [];
                  const voted = votes.includes(authUser.uid);
                  const max = Math.max(...polls.map(x => (x.votes || []).length), 1);
                  const lead = votes.length === max && max > 0 && polls.length > 1;
                  const voterProfiles = votes.slice(0, 4).map(uid => allUsers.find(u => u.uid === uid));
                  return (
                    <button key={p.id}
                      className={cn("relative w-full overflow-hidden rounded-2xl bg-secondary/50 p-4 text-left transition-all", voted && "bg-blue-50 ring-2 ring-blue-500", lead && !voted && "bg-green-50")}
                      onClick={() => handleVote(p.id)}>
                      <div className="absolute inset-y-0 left-0 bg-blue-100 transition-all duration-500" style={{ width: `${(votes.length / max) * 100}%` }} />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.label}{lead && " 🔥"}</p>
                          {p.date && <p className="text-[10px] text-muted-foreground">{new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>}
                          <div className="mt-2 flex">
                            {voterProfiles.map((u, i) => u && (
                              <div key={i} className="-mr-1.5 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white text-xs" style={{ background: u.color || "#3B82F6" }}>
                                {u.avatar || "☕"}
                              </div>
                            ))}
                            {votes.length > 4 && <div className="-mr-1.5 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white bg-muted text-[9px] font-semibold">+{votes.length - 4}</div>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn("flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold", voted ? "bg-blue-500 text-white" : "bg-blue-600 text-white")}>
                            {voted && <Check className="h-3 w-3" />}{voted ? "Voted" : "Vote"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{votes.length} vote{votes.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button className="mt-3 w-full rounded-2xl border-2 border-dashed border-border py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                onClick={() => setShowPollModal(true)}>
                + Suggest a time
              </button>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm shadow-foreground/5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100">
                  <Users className="h-5 w-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-foreground">Who&apos;s in?</h3>
              </div>
              {allUsers.length === 0 && <p className="text-sm text-muted-foreground">No members yet!</p>}
              <div className="space-y-2">
                {allUsers.map((u, i) => (
                  <div key={u.uid} className="animate-slide-up flex items-center gap-3 rounded-2xl bg-secondary/50 p-3"
                    style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ background: u.color || "#3B82F6" }}>
                      {u.avatar || "☕"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        {u.displayName}
                        {u.uid === authUser.uid && <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">You</span>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{u.isHere ? "Here now" : u.status || ""}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold", u.isHere ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground")}>
                      {u.isHere ? "Here" : "Not yet"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CALENDAR TAB */}
        {tab === "calendar" && authUser && (
          <CalendarTab visits={visits} currentUser={authUser} onAddVisit={handleAddVisit} onDeleteVisit={handleDeleteVisit} />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="animate-toast fixed bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background shadow-2xl">
          {toast}
        </div>
      )}

      {/* Add Poll Modal */}
      {showPollModal && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={() => setShowPollModal(false)}>
          <div className="animate-slide-up-modal w-full max-w-[420px] rounded-t-[2rem] bg-white px-6 pb-8 pt-4"
            onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-border" />
            <h3 className="mb-6 text-xl font-semibold text-foreground">Suggest a meetup time</h3>
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</label>
              <input type="date"
                className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary"
                value={newPollDate} min={new Date().toISOString().slice(0, 10)}
                onChange={e => setNewPollDate(e.target.value)} />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time / Description</label>
              <input className="w-full rounded-2xl border-0 bg-secondary px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-all focus:ring-2 focus:ring-primary"
                placeholder="e.g. 2 PM, Morning coffee, After work..." value={newPollLabel}
                onChange={e => setNewPollLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddPoll()} />
            </div>
            <button className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98]"
              onClick={handleAddPoll}>Add to Poll</button>
            <button className="mt-3 w-full py-2 text-sm font-medium text-muted-foreground" onClick={() => setShowPollModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Group Assignment Modal */}
      {groupAssignTarget && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={() => setGroupAssignTarget(null)}>
          <div className="animate-slide-up-modal w-full max-w-[420px] rounded-t-[2rem] bg-white px-6 pb-8 pt-4"
            onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-border" />
            <h3 className="mb-6 text-xl font-semibold text-foreground">Move to group</h3>
            <div className="space-y-2">
              {GROUPS.filter(g => g !== "All Friends").map(g => (
                <button key={g}
                  className={cn("block w-full rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-colors",
                    (myFriendGroups[groupAssignTarget] || "") === g ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted")}
                  onClick={() => handleAssignGroup(groupAssignTarget, g)}>{g}</button>
              ))}
              <button className="block w-full rounded-2xl bg-secondary px-4 py-3.5 text-left text-sm font-medium italic text-muted-foreground transition-colors hover:bg-muted"
                onClick={() => handleAssignGroup(groupAssignTarget, "All Friends")}>
                Remove from group
              </button>
            </div>
            <button className="mt-4 w-full py-2 text-sm font-medium text-muted-foreground" onClick={() => setGroupAssignTarget(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
