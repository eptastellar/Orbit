import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { LoadingOverlay } from "@/components"
import { useAuthContext } from "@/contexts"

type Props = {
   children: JSX.Element
   isConfirmPage?: boolean // Skip auth check on the confirmation page
   firebaseAuth?: boolean
   serverAuth?: boolean
}

const Wrapper = ({ children, isConfirmPage, firebaseAuth, serverAuth }: Props) => function Wrapper() {
   // Context hooks
   const { currentUser } = useAuthContext()

   const navigateTo = useNavigate()

   // Loading and session states
   const [loading, setLoading] = useState<boolean>(true)
   const sessionToken = localStorage.getItem("sessionToken")

   useEffect(() => {
      if (firebaseAuth) {
         if (sessionToken) navigateTo("/")
         else if (!currentUser) navigateTo("/onboarding")
         else if (!currentUser.emailVerified && !isConfirmPage) navigateTo("/onboarding/verification")
         else if (currentUser.emailVerified && isConfirmPage) navigateTo("/onboarding/profile")
      }
      else if (!firebaseAuth && currentUser) navigateTo("/")
      else if (serverAuth && (!currentUser || !sessionToken)) navigateTo("/onboarding")

      setLoading(false)
   }, [])

   return loading ? <LoadingOverlay /> : (
      <div className="h-screen w-screen bg-black">
         <div className="relative m-auto h-full max-w-[500px]">
            {children}
         </div>
      </div>
   )
}

export default Wrapper
