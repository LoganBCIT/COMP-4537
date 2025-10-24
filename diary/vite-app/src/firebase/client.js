import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

// Read Firebase config from Vite env vars (VITE_***). If not provided, the
// app will fail to initialize; users should copy .env.local.sample to .env.local
// and fill values.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Helpful debug output for runtime diagnosis. These logs are harmless in
// production but very useful during development to confirm the Vite env
// variables were loaded and the client is pointed at the expected project.
try {
  // eslint-disable-next-line no-console
  console.log('[firebase] config projectId:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
  // eslint-disable-next-line no-console
  console.log('[firebase] full config:', firebaseConfig)
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[firebase] unable to log config', e)
}

let app
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
} catch (err) {
  // Initialization errors here are often caused by missing env vars or a
  // misconfigured firebaseConfig; surface a clear message in the console.
  // eslint-disable-next-line no-console
  console.error('[firebase] initialization error', err)
  throw err
}

const db = getFirestore(app)

// Fetch entries ordered by createdAt (server timestamp) descending
export async function fetchRecentEntries(limitCount = 10) {
  const q = query(collection(db, 'entries'), orderBy('createdAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export { db }

// Backwards-compatible alias used by some components
export const fetchEntries = fetchRecentEntries

// Idempotent initializer for components that expect an explicit init function
export function initFirebaseClient() {
  // already initialized during module import; return db for convenience
  return db
}
