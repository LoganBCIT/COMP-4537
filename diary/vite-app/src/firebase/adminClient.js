import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { db } from './client'
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore'

// Thin admin-facing helpers for the client app. These use the already-
// initialized Firebase app in `client.js` so importing this file is idempotent.
export const auth = getAuth()

export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOutUser() {
  return signOut(auth)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function addEntry(entry) {
  // entry is expected to be { title, body, tags?, date? }
  const col = collection(db, 'entries')
  const payload = {
    ...entry,
    tags: entry.tags || [],
    date: entry.date || new Date().toISOString(),
    createdAt: serverTimestamp(),
  }
  const ref = await addDoc(col, payload)
  return ref.id
}

export async function deleteEntryById(id) {
  if (!id) throw new Error('id required')
  return deleteDoc(doc(db, 'entries', id))
}

export async function updateEntryById(id, fields) {
  if (!id) throw new Error('id required')
  if (!fields || typeof fields !== 'object') throw new Error('fields required')
  // add an updatedAt timestamp for record
  const payload = { ...fields, updatedAt: serverTimestamp() }
  return updateDoc(doc(db, 'entries', id), payload)
}
