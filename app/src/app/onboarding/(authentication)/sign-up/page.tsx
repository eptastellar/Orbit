"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { BackButton, FullInput, LargeButton } from "@/components"
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
   const [emailError, setEmailError] = useState<string>("")
   const [passwordError, setPasswordError] = useState<string>("")
   const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")

   // Interaction states
   const [email, setEmail] = useState<string>("")
   const [password, setPassword] = useState<string>("")
   const [confirmPassword, setConfirmPassword] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      setError("")
      setEmailError("")
      setPasswordError("")
      setConfirmPasswordError("")

      if (!email) return setEmailError("Input an email.")
      if (!password) return setPasswordError("Input a password.")
      if (!confirmPassword) return setConfirmPasswordError("Input a password.")
      if (password !== confirmPassword) return setConfirmPasswordError("Passwords do not match.")

      // Signup the user with firebase
      setLoading(true)

      emailSignup(email, password)
         .then(() => router.push("/onboarding/verification"))
         .catch((error: any) => {
            setError(resolveFirebaseError(error.message))
            setLoading(false)
         })
   }

   return (
      <div className="flex flex-col between gap-16 h-full w-full p-8">
         <div className="flex flex-col center gap-2 mt-16">
            <h1 className="text-4xl font-bold text-white">
               Join us in space
            </h1>
            <p className="text-sm font-semibold text-gray-3">
               Connect with people around the galaxy
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
               <FullInput
                  type="password"
                  label="Your password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  value={password}
                  error={passwordError}
                  onChange={setPassword}
               />
               <FullInput
                  type="password"
                  label="Confirm password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  value={confirmPassword}
                  error={confirmPasswordError}
                  onChange={setConfirmPassword}
               />

               {error && (
                  <p className="text-center text-base font-normal text-red-5">
                     {error}
                  </p>
               )}

               <LargeButton
                  text="Join the galaxy"
                  loading={loading}
                  loadingText="Building your rocket..."
                  submitBtn
                  onClick={handleSubmit}
               />
            </form>

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

         <BackButton destinationPage="/onboarding" />
      </div>
   )
}

export default Signup
