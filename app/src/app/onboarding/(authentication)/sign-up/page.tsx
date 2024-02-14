"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { BackButton, Input, LargeButton } from "@/components"
import { useAuthContext } from "@/contexts"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"

const Signup = () => {
   // Context hooks
   const { emailSignup } = useAuthContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   // Interaction states
   const [email, setEmail] = useState<string>("")
   const [password, setPassword] = useState<string>("")
   const [confirmPassword, setConfirmPassword] = useState<string>("")

   const handleSubmit = async () => {
      // Preliminary checks
      if (password !== confirmPassword)
         return setError("Passwords do not match.")

      setLoading(true)

      emailSignup(email, password)
         .then(() => router.push("/onboarding/verification"))
         .catch((error: any) => {
            setError(resolveFirebaseError(error.message))
            setLoading(false)
         })
   }

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               Join us in space
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Connect with people around the galaxy
            </p>
         </div>

         <div className="flex flex-col center gap-4 w-full">
            <div className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
               <Input
                  label="Your personal email"
                  placeholder="astro@email.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
               />
               <Input
                  label="Your password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
               />
               <Input
                  label="Confirm password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
               />

               <p className="text-center text-red-5">{error}</p>

               <LargeButton
                  text="Join the galaxy"
                  loading={loading}
                  loadingText="Building your rocket..."
                  onClick={handleSubmit}
               />
            </div>

            <p className="text-base font-medium text-gray-3">
               Already have an account? {" "}
               <span
                  className="font-bold text-white underline underline-offset-4 cursor-pointer"
                  onClick={() => router.push("/onboarding/sign-in")}
               >
                  Sign in.
               </span>
            </p>
         </div>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Signup
