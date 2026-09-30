/**
 * Firebase Authentication for LUMORA
 *
 * SETUP (required for real Google auth + email verification):
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project (or use existing)
 * 3. Enable Authentication → Sign-in method → Email/Password AND Google
 * 4. Project settings → Your apps → Web app → copy config
 * 5. Create a file `.env` in the project root (see .env.example)
 * 6. Add authorized domains in Firebase Auth settings (localhost + your domain)
 *
 * Email verification and password reset emails are sent by Firebase automatically.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
)

let app: FirebaseApp | null = null
let auth: Auth | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
}

export { auth, app }

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export type { FirebaseUser }

export async function firebaseGoogleSignIn() {
  if (!auth) throw new Error('Firebase is not configured. Add your keys to .env')
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function firebaseEmailSignUp(email: string, password: string, displayName: string) {
  if (!auth) throw new Error('Firebase is not configured. Add your keys to .env')
  const result = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateProfile(result.user, { displayName })
  }
  await sendEmailVerification(result.user)
  return result.user
}

export async function firebaseEmailSignIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase is not configured. Add your keys to .env')
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function firebaseSendPasswordReset(email: string) {
  if (!auth) throw new Error('Firebase is not configured. Add your keys to .env')
  await sendPasswordResetEmail(auth, email)
}

export async function firebaseChangePassword(currentPassword: string, newPassword: string) {
  if (!auth?.currentUser || !auth.currentUser.email) {
    throw new Error('Not signed in with email/password')
  }
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
  await reauthenticateWithCredential(auth.currentUser, credential)
  await updatePassword(auth.currentUser, newPassword)
}

export async function firebaseResendVerification() {
  if (!auth?.currentUser) throw new Error('Not signed in')
  await sendEmailVerification(auth.currentUser)
}

export async function firebaseSignOut() {
  if (!auth) return
  await signOut(auth)
}

export function onFirebaseAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export function mapFirebaseUser(fu: FirebaseUser) {
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'thezenvoratech@gmail.com')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
  const email = (fu.email || '').toLowerCase()
  return {
    id: fu.uid,
    name: fu.displayName || email.split('@')[0] || 'Guest',
    email: fu.email || '',
    avatar: fu.photoURL || undefined,
    favorites: [] as string[],
    createdAt: fu.metadata.creationTime || new Date().toISOString(),
    emailVerified: fu.emailVerified,
    role: (adminEmails.includes(email) ? 'admin' : 'user') as 'admin' | 'user',
  }
}
