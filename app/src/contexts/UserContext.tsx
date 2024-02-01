"use client"

import { createContext, useContext } from "react"

import { useLocalStorage } from "@/hooks"
import { UserProfile } from "@/types"

type userContextType = {
   userProfile: UserProfile | null
   setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
}

const UserContext = createContext<userContextType>({} as userContextType)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
   const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>("user-profile", null)

   return (
      <UserContext.Provider
         value={{
            userProfile,
            setUserProfile
         }}
      >
         {children}
      </UserContext.Provider>
   )
}

export const useUserContext = () => useContext(UserContext)
