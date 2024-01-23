import { initializeApp } from "firebase/app"
import { GoogleAuthProvider, getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const app = initializeApp({
   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
})

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const storage = getStorage(app)
