"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"
import { useAuthContext, useUserContext } from "@/contexts"

const AppLayout = ({ children }: { children: React.ReactNode }) => {
   // Context hooks
   const { currentUser } = useAuthContext()
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Loading and session states
   const [loading, setLoading] = useState<boolean>(true)
   const sessionToken = userProfile?.sessionToken

   useEffect(() => {
      if (!currentUser || !currentUser.emailVerified || !sessionToken)
         router.push("/onboarding")
      else setLoading(false)
   }, [currentUser, userProfile])

   return loading ? <LoadingOverlay /> : (
      <div className="h-screen w-screen bg-black">
         <div className="relative m-auto h-full max-w-screen-device">
            {children}
         </div>
      </div>
   )
}

export default AppLayout
