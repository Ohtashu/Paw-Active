import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, TwitterAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             ?? 'AIzaSyBJFsa5PCDF4ri8WP2-6r6xe9v-tWpFKLU',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         ?? 'paw-active-219dc.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          ?? 'paw-active-219dc',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      ?? 'paw-active-219dc.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '450669929246',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              ?? '1:450669929246:web:e6695a1833b13c72a55f0f',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID      ?? 'G-TKFGLLSN41',
};

// Prevent duplicate app error on Vite HMR reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db   = getFirestore(app);

// Analytics is optional — initialise lazily only when the browser supports it
export let analytics = null;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
}).catch(() => {});

export const googleProvider   = new GoogleAuthProvider();
export const twitterProvider  = new TwitterAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
