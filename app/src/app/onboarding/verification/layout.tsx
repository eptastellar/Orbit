"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { LoadingOverlay } from "@/components"
import { useAuthContext } from "@/contexts"

const VerificationRules = ({ children }: { children: React.ReactNode }) => {
   // Context hooks
   const { currentUser } = useAuthContext()

   // Next router for navigation
   const router = useRouter()

   // Loading and async states
   const [loading, setLoading] = useState<boolean>(true)

   useEffect(() => {
      if (currentUser && currentUser.emailVerified)
         router.replace("/onboarding/profile")
      else if (!currentUser) router.replace("/onboarding")
      else setLoading(false)
   }, [])

   return loading ? <LoadingOverlay /> : children
}

export default VerificationRules
