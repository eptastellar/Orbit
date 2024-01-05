import {
   User,
   UserCredential,
   createUserWithEmailAndPassword,
   onAuthStateChanged,
   sendPasswordResetEmail,
   signInWithEmailAndPassword,
   signInWithPopup,
   signOut,
   updateEmail,
   updatePassword,
} from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"
import { auth, googleProvider } from "@/libraries/firebase"

type authContextType = {
   currentUser: User | null

   // Email and password actions
   emailLogin: (email: string, password: string) => Promise<UserCredential>
   emailSignup: (email: string, password: string) => Promise<UserCredential>
   resetUserPassword: (email: string) => Promise<void>
   updateUserEmail: (email: string) => Promise<void>
   updateUserPassword: (password: string) => Promise<void>

   // Authentication provider actions
   googleLogin: () => Promise<UserCredential>

   // Global authentication functions
   logout: () => Promise<void>
}

const AuthContext = createContext<authContextType>({} as authContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [currentUser, setCurrentUser] = useState<User | null>(null)
   const [loading, setLoading] = useState<boolean>(true)

   // Email and password actions
   const emailLogin = (email: string, password: string) =>
      signInWithEmailAndPassword(auth, email, password)

   const emailSignup = (email: string, password: string) =>
      createUserWithEmailAndPassword(auth, email, password)

   const resetUserPassword = (email: string) =>
      sendPasswordResetEmail(auth, email)

   const updateUserEmail = (email: string) =>
      updateEmail(currentUser!, email)

   const updateUserPassword = (password: string) =>
      updatePassword(currentUser!, password)

   // Authentication provider actions
   const googleLogin = () =>
      signInWithPopup(auth, googleProvider)

   // Global authentication functions
   const logout = () =>
      signOut(auth)

   useEffect(() =>
      onAuthStateChanged(auth, user => {
         setCurrentUser(user)
         setLoading(false)
      }), []
   )

   return (
      <AuthContext.Provider
         value={{
            currentUser,

            // Email and password actions
            emailLogin,
            emailSignup,
            resetUserPassword,
            updateUserEmail,
            updateUserPassword,

            // Authentication provider actions
            googleLogin,

            // Global authentication functions
            logout,
         }}
      >
         {loading ? <LoadingOverlay /> : children}
      </AuthContext.Provider>
   )
}

export const useAuthContext = () => useContext(AuthContext)
