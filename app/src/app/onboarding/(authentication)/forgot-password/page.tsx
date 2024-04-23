"use client"

import { useState } from "react"
import { toast } from "react-toastify"

import { BackButton, FullInput, LargeButton } from "@/components"
import { useAuthContext } from "@/contexts"
import { resolveFirebaseError } from "@/libraries/errors"

const ForgotPassword = () => {
   // Context hooks
   const { resetUserPassword } = useAuthContext()

   // Loading and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [emailError, setEmailError] = useState<string>("")
   const [confirmEmailError, setConfirmEmailError] = useState<string>("")
   const [success, setSuccess] = useState<boolean>(false)

   // Interaction states
   const [email, setEmail] = useState<string>("")
   const [confirmEmail, setConfirmEmail] = useState<string>("")

   // Custom functions triggered by interactions
   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      setEmailError("")
      setConfirmEmailError("")
      setSuccess(false)

      if (!email) return setEmailError("Input an email.")
      if (!confirmEmail) return setConfirmEmailError("Input an email.")
      if (email !== confirmEmail) return setConfirmEmailError("Emails do not match.")

      // Send password reset email
      setLoading(true)

      resetUserPassword(email)
         .then(() => setSuccess(true))
         .catch((error: Error) => {
            if (error.message.includes("auth/invalid-email"))
               setEmailError("Invalid email.")
            else toast.error(resolveFirebaseError(error.message))
         })
         .finally(() => setLoading(false))
   }

   return (
      <div className="flex flex-col between gap-16 h-full w-full p-8">
         <div className="flex flex-col center gap-2 mt-16">
            <p className="text-4xl font-bold text-white">
               Forgot password
            </p>
            <p className="text-sm font-semibold text-gray-3">
               Mayday Houston, I forgot my password
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
                  type="email"
                  label="Confirm email"
                  placeholder="astro@email.com"
                  value={confirmEmail}
                  error={confirmEmailError}
                  onChange={setConfirmEmail}
               />

               <LargeButton
                  text="Send a reset email"
                  loading={loading}
                  loadingText="Asking Houston..."
                  submitBtn
                  onClick={handleSubmit}
               />
            </form>

            {success && (
               <p className="text-center text-base font-medium text-gray-3">
                  A password reset email has been sent. <br />
                  Check your email for further instructions!
               </p>
            )}
         </div>

         <BackButton href="/onboarding/sign-in" />
      </div>
   )
}

export default ForgotPassword
