"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { passwordUpdate } from "@/assets"
import { Cross, IconButton } from "@/assets/icons"
import { FullInput, HeaderWithButton, LargeButton } from "@/components"
import { useAuthContext } from "@/contexts"
import { resolveFirebaseError } from "@/libraries/errors"

const UpdatePassword = () => {
   // Context hooks
   const { hasRecentLogin, updateUserPassword } = useAuthContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [passwordError, setPasswordError] = useState<string>("")
   const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")
   const [success, setSuccess] = useState<boolean>(false)

   // Interaction states
   const [password, setPassword] = useState<string>("")
   const [confirmPassword, setConfirmPassword] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      setPasswordError("")
      setConfirmPasswordError("")

      if (!password) return setPasswordError("Input a password.")
      if (!confirmPassword) return setConfirmPasswordError("Input a password.")
      if (password !== confirmPassword) return setConfirmPasswordError("Passwords do not match.")

      if (!hasRecentLogin()) return toast.warn(resolveFirebaseError("auth/requires-recent-login"))

      // Update the user's password
      setLoading(true)

      updateUserPassword(password)
         .then(() => setSuccess(true))
         .catch((error: Error) => {
            toast.error(resolveFirebaseError(error.message))
            setSuccess(false)
         })
         .finally(() => setLoading(false))
   }

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            title="Update Password"
            icon={
               <IconButton
                  icon={<Cross height={24} />}
                  onClick={() => router.back()}
               />
            }
         />

         <form
            className="flex flex-col gap-8 h-full w-full p-8"
            onSubmit={handleSubmit}
         >
            <div className="flex flex-grow flex-col center gap-16 w-full">
               <Image
                  src={passwordUpdate}
                  alt="Update password illustration"
                  className="w-3/4"
               />

               <div className="flex flex-col center gap-4 w-full">
                  <FullInput
                     type="password"
                     label="New Password"
                     placeholder="SeCrE7#Pa5sW0rD"
                     value={password}
                     error={passwordError}
                     onChange={setPassword}
                  />
                  <FullInput
                     type="password"
                     label="Confirm Password"
                     placeholder="SeCrE7#Pa5sW0rD"
                     value={confirmPassword}
                     error={confirmPasswordError}
                     onChange={setConfirmPassword}
                  />

                  {success && (
                     <p className="text-center text-base font-medium text-gray-3">
                        A password reset email has been sent. <br />
                        Check your email for further instructions!
                     </p>
                  )}
               </div>
            </div>

            <LargeButton
               text="Update Password"
               loading={loading}
               loadingText="Updating your password..."
               submitBtn
               onClick={handleSubmit}
            />
         </form>
      </div>
   )
}

export default UpdatePassword
