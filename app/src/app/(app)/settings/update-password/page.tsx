"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { passwordUpdate } from "@/assets"
import { Cross, IconButton } from "@/assets/icons"
import { HeaderWithButton, Input, LargeButton } from "@/components"
import { useAuthContext } from "@/contexts"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"

const UpdatePassword = () => {
   // Context hooks
   const { updateUserPassword } = useAuthContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")
   const [success, setSuccess] = useState<boolean>(false)

   // Interaction states
   const [password, setPassword] = useState<string>("")
   const [confirmPassword, setConfirmPassword] = useState<string>("")

   const handleSubmit = () => {
      // Preliminary checks
      if (password !== confirmPassword)
         return setError("Passwords do not match.")

      setLoading(true)

      updateUserPassword(password)
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

         <div className="flex flex-grow flex-col center gap-16 w-full p-8">
            <Image
               src={passwordUpdate}
               alt="Update password illustration"
               className="w-3/4"
            />

            <div className="flex flex-col center gap-4 w-full">
               <Input
                  label="New Password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
               />
               <Input
                  label="Confirm Password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
               />

               <p className="text-center text-red-5">{error}</p>

               {success && (
                  <p className="text-center text-base font-medium text-gray-3">
                     A password reset email has been sent. <br />
                     Check your email for further instructions!
                  </p>
               )}
            </div>
         </div>

         <div className="w-full p-8 pt-0">
            <LargeButton
               text="Update Password"
               loading={loading}
               loadingText="Updating your password..."
               onClick={handleSubmit}
            />
         </div>
      </div>
   )
}

export default UpdatePassword
