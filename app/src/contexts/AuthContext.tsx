"use client"

import {
   User,
   UserCredential,
   createUserWithEmailAndPassword,
   deleteUser as deleteUserAccount,
   onAuthStateChanged,
   sendEmailVerification,
   sendPasswordResetEmail,
   signInWithEmailAndPassword,
   signInWithPopup,
   signOut,
   updateEmail,
   updatePassword
} from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"
import { auth, googleProvider } from "@/libraries/firebase"

type authContextType = {
   currentUser: User | null
   getUserId: (forceRefresh?: boolean) => Promise<string>

   // Email and password actions
   emailSignin: (email: string, password: string) => Promise<UserCredential>
   emailSignup: (email: string, password: string) => Promise<UserCredential>
   resetUserPassword: (email: string) => Promise<void>
   updateUserEmail: (email: string) => Promise<void>
   updateUserPassword: (password: string) => Promise<void>

   // Authentication provider actions
   googleLogin: () => Promise<UserCredential>

   // Global authentication functions
   deleteUser: () => Promise<void>
   logout: () => Promise<void>
}

const AuthContext = createContext<authContextType>({} as authContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [currentUser, setCurrentUser] = useState<User | null>(null)
   const [loading, setLoading] = useState<boolean>(true)

   const getUserId = async (forceRefresh?: boolean) =>
      await currentUser?.getIdToken(forceRefresh) ?? ""

   // Email and password actions
   const emailSignin = (email: string, password: string) =>
      signInWithEmailAndPassword(auth, email, password)

   const emailSignup = (email: string, password: string) => (
      createUserWithEmailAndPassword(auth, email, password)
         .then((user) => {
            sendEmailVerification(user.user)
            return user
         })
   )

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
   const deleteUser = () =>
      deleteUserAccount(currentUser!)

   const logout = () =>
      signOut(auth)

   useEffect(() => onAuthStateChanged(auth, user => {
      setCurrentUser(user)
      setLoading(false)
   }), [])

   return (
      <AuthContext.Provider
         value={{
            currentUser,
            getUserId,

            // Email and password actions
            emailSignin,
            emailSignup,
            resetUserPassword,
            updateUserEmail,
            updateUserPassword,

            // Authentication provider actions
            googleLogin,

            // Global authentication functions
            deleteUser,
            logout,
         }}
      >
         {loading ? <LoadingOverlay /> : children}
      </AuthContext.Provider>
   )
}

export const useAuthContext = () => useContext(AuthContext)
