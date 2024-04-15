"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"
import { useUserContext } from "@/contexts"

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Loading and async states
   const [loading, setLoading] = useState<boolean>(true)
   const sessionToken = userProfile?.sessionToken

   useEffect(() => {
      if (sessionToken) router.push("/")
      else setLoading(false)
   }, [userProfile])

   return loading ? <LoadingOverlay /> : (
      <div className="h-screen w-screen">
         <div className="relative m-auto h-full max-w-screen-device">
            {children}
         </div>
      </div>
   )
}

export default OnboardingLayout
