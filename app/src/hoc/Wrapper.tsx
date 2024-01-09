import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { LoadingOverlay } from "@/components"
import { useAuthContext } from "@/contexts"

type Props = {
   children: JSX.Element
   isConfirmPage?: boolean // Skip auth check on the confirmation page
   needsAuth?: boolean
}

const Wrapper = ({ children, isConfirmPage, needsAuth }: Props) => function Wrapper() {
   const { currentUser } = useAuthContext()

   const navigateTo = useNavigate()

   const [loading, setLoading] = useState<boolean>(true)

   useEffect(() => {
      if (needsAuth) {
         if (!currentUser) navigateTo("/onboarding")
         else if (!currentUser.emailVerified && !isConfirmPage) navigateTo("/onboarding/confirmation")
         else if (currentUser.emailVerified && isConfirmPage) navigateTo("/onboarding/profile")
         // TODO: Future conditions with the server session token
      }
      if (!needsAuth && currentUser) navigateTo("/")

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
