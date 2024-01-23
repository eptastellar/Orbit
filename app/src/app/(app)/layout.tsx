"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"
import { useAuthContext } from "@/contexts"

const AppLayout = ({ children }: { children: React.ReactNode }) => {
   // Context hooks
   const { currentUser } = useAuthContext()

   // Next router for navigation
   const router = useRouter()

   // Loading and session states
   const [loading, setLoading] = useState<boolean>(true)
   const sessionToken = localStorage.getItem("sessionToken")

   useEffect(() => {
      if (!currentUser || !currentUser.emailVerified || !sessionToken)
         router.push("/onboarding")
      else setLoading(false)
   }, [currentUser])

   return loading ? <LoadingOverlay /> : (
      <div className="h-screen w-screen bg-black">
         <div className="relative m-auto h-full max-w-[500px]">
            {children}
         </div>
      </div>
   )
}

export default AppLayout
