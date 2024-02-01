"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { BackButton, Input, SpinnerText } from "@/components"
import { useAuthContext, useUserContext } from "@/contexts"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"
import { resolveServerError } from "@/libraries/serverErrors"

const Signin = () => {
   // Context hooks
   const { emailSignin } = useAuthContext()
   const { setUserProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   // Interaction states
   const [email, setEmail] = useState<string>("")
   const [password, setPassword] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      setLoading(true)

      emailSignin(email, password)
         .then(async (user) => {
            const params: RequestInit = {
               method: "GET",
               headers: { "Authorization": "Bearer " + await user.user.getIdToken() }
            }

            type ResponseType = {
               success: boolean
               message: string
               jwt: string
               pfp: string
               username: string
            }
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`, params)
               .then((response) => response.json())
               .then(({ success, message, jwt, pfp, username }: ResponseType) => {
                  if (success) {
                     setError("")

                     setUserProfile({
                        profilePicture: pfp,
                        username: username,
                        sessionToken: jwt
                     })

                     router.push(`/u/${username}`)
                  } else if (message === "auth/user-not-signed-up") {
                     router.push("/onboarding/profile")
                  } else {
                     setError(resolveServerError(message))
                     setLoading(false)
                  }
               })
         })
         .catch((error: any) => {
            setError(resolveFirebaseError(error.message))
            setLoading(false)
         })
   }

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               Sign in
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Access your space account
            </p>
         </div>

         <div className="flex flex-col center gap-4 w-full">
            <form
               className="flex flex-col w-full gap-4"
               onSubmit={handleSubmit}
            >
               <Input
                  label="Your personal email"
                  placeholder="astro@email.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
               />
               <div className="flex flex-col items-end justify-center gap-1 w-full">
                  <Input
                     label="Your password"
                     placeholder="SeCrE7#Pa5sW0rD"
                     type="password"
                     value={password}
                     onChange={(event) => setPassword(event.target.value)}
                  />
                  <p className="text-xs font-medium text-gray-3">
                     Did you {" "}
                     <span
                        className="text-white underline underline-offset-4 cursor-pointer"
                        onClick={() => router.push("/onboarding/forgot-password")}
                     >
                        forget your password?
                     </span>
                  </p>
               </div>

               <p className="text-center text-red-5">{error}</p>

               <button
                  type="submit"
                  className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
               >
                  {loading ? <SpinnerText message="Reaching your rocket..." /> : <p>Join the galaxy</p>}
               </button>
            </form>

            <p className="text-base font-medium text-gray-3">
               Don't have an account? {" "}
               <span
                  className="font-bold text-white underline underline-offset-4 cursor-pointer"
                  onClick={() => router.push("/onboarding/sign-up")}
               >
                  Sign up.
               </span>
            </p>
         </div>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Signin
