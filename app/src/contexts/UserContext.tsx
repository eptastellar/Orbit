"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"
import { useLocalStorage } from "@/hooks"
import { LocalUser } from "@/types"

type userContextType = {
   userProfile: LocalUser | null
   setUserProfile: React.Dispatch<React.SetStateAction<LocalUser | null>>
}

const UserContext = createContext<userContextType>({} as userContextType)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
   const [userProfile, setUserProfile] = useLocalStorage<LocalUser | null>("user-profile", null)
   const [loading, setLoading] = useState<boolean>(true)

   useEffect(() => setLoading(false), [])

   return (
      <UserContext.Provider
         value={{
            userProfile,
            setUserProfile
         }}
      >
         {loading ? <LoadingOverlay /> : children}
      </UserContext.Provider>
   )
}

export const useUserContext = () => useContext(UserContext)
