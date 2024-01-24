"use client"

import { useState } from "react"

import { BackButton, Input, SpinnerText } from "@/components"
import { useAuthContext } from "@/contexts"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"

const ForgotPassword = () => {
   // Context hooks
   const { resetUserPassword } = useAuthContext()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")
   const [success, setSuccess] = useState<boolean>(false)

   // Interaction states
   const [email, setEmail] = useState<string>("")
   const [confirmEmail, setConfirmEmail] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      if (email !== confirmEmail)
         return setError("Emails do not match.")

      setLoading(true)

      resetUserPassword(email)
         .then(() => {
            setError("")
            setSuccess(true)
         })
         .catch((error: any) => {
            setError(resolveFirebaseError(error.message))
            setSuccess(false)
         })
         .finally(() => setLoading(false))
   }

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               Forgot password
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Mayday Houston, I forgot my password
            </p>
         </div>

         <div className="flex flex-col center gap-16 w-full">
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
               <Input
                  label="Confirm email"
                  placeholder="astro@email.com"
                  type="email"
                  value={confirmEmail}
                  onChange={(event) => setConfirmEmail(event.target.value)}
               />

               <p className="text-center text-red-5">{error}</p>

               <button
                  type="submit"
                  className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
               >
                  {loading ? <SpinnerText message="Asking Houston..." /> : <p>Send a reset email</p>}
               </button>
            </form>

            {success && (
               <p className="text-center text-base font-medium text-gray-3">
                  A password reset email has been sent. <br />
                  Check your email for further instructions!
               </p>
            )}
         </div>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default ForgotPassword
