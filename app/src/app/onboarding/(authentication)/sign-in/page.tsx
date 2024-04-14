"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { BackButton, FullInput, LargeButton } from "@/components"
import { useAuthContext, useUserContext } from "@/contexts"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"
import { resolveServerError } from "@/libraries/serverErrors"
import { ServerError } from "@/types"

const Signin = () => {
   // Context hooks
   const { emailSignin } = useAuthContext()
   const { setUserProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Loading and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")
   const [emailError, setEmailError] = useState<string>("")
   const [passwordError, setPasswordError] = useState<string>("")

   // Interaction states
   const [email, setEmail] = useState<string>("")
   const [password, setPassword] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      setError("")
      setEmailError("")
      setPasswordError("")

      if (!email) return setEmailError("Input an email.")
      if (!password) return setPasswordError("Input a password.")

      // Login the user with firebase and the server
      setLoading(true)

      emailSignin(email, password)
         .then(async (user) => {
            const params: RequestInit = {
               method: "GET",
               headers: { "Authorization": "Bearer " + await user.user.getIdToken() }
            }

            type ResponseType = {
               success: boolean
               message: ServerError
               jwt: string
               pfp: string
               username: string
            }

            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`, params)
               .then((response) => response.json())
               .then(({ success, message, jwt, pfp, username }: ResponseType) => {
                  if (success) {
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
      <div className="flex flex-col between gap-16 h-full w-full p-8">
         <div className="flex flex-col center gap-2 mt-16">
            <h1 className="text-4xl font-bold text-white">
               Sign in
            </h1>
            <p className="text-sm font-semibold text-gray-3">
               Access your space account
            </p>
         </div>

         <div className="flex flex-col center gap-8 w-full">
            <form
               className="flex flex-col center gap-4 w-full"
               onSubmit={handleSubmit}
            >
               <FullInput
                  type="email"
                  label="Your personal email"
                  placeholder="astro@email.com"
                  value={email}
                  error={emailError}
                  onChange={setEmail}
               />
               <div className="flex flex-col items-end justify-center gap-1 w-full">
                  <FullInput
                     type="password"
                     label="Your password"
                     placeholder="SeCrE7#Pa5sW0rD"
                     value={password}
                     error={passwordError}
                     onChange={setPassword}
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

               {error && (
                  <p className="text-center text-base font-normal text-red-5">
                     {error}
                  </p>
               )}

               <LargeButton
                  text="Join the galaxy"
                  loading={loading}
                  loadingText="Reaching your rocket..."
                  submitBtn
                  onClick={handleSubmit}
               />
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

         <BackButton destinationPage="/onboarding" />
      </div>
   )
}

export default Signin
