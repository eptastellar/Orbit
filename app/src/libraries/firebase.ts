import { initializeApp } from "firebase/app"
import { GoogleAuthProvider, getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const app = initializeApp({
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
   appId: import.meta.env.VITE_FIREBASE_APP_ID,
   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
})

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const storage = getStorage(app)
