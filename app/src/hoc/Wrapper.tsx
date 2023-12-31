import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { LoadingOverlay } from "@/components"
import { useAuthContext } from "@/contexts"

type Props = {
   children: JSX.Element
   needsAuth?: boolean
}

const Wrapper = ({ children, needsAuth }: Props) => function Wrapper() {
   const { currentUser } = useAuthContext()

   const navigateTo = useNavigate()

   useEffect(() => {
      if (needsAuth && !currentUser) navigateTo("/signin")
      if (!needsAuth && currentUser) navigateTo("/")
   }, [])

   if (needsAuth && !currentUser) return <LoadingOverlay />
   if (!needsAuth && currentUser) return <LoadingOverlay />

   return (
      <div className="h-screen w-screen bg-black">
         <div className="relative m-auto h-full max-w-[500px]">
            {children}
         </div>
      </div>
   )
}

export default Wrapper
