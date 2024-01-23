"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
   // Next router for navigation
   const router = useRouter()

   // Loading and session states
   const [loading, setLoading] = useState<boolean>(true)
   const sessionToken = localStorage.getItem("sessionToken")

   useEffect(() => {
      if (sessionToken) router.push("/")
      else setLoading(false)
   }, [])

   return loading ? <LoadingOverlay /> : (
      <div className="h-screen w-screen bg-black">
         <div className="relative m-auto h-full max-w-[500px]">
            {children}
         </div>
      </div>
   )
}

export default OnboardingLayout
