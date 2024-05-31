"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { Cross, IconButton } from "@/assets/icons"
import { FloatingConfirmation, HeaderWithButton, SettingsButton } from "@/components"
import { useAuthContext, useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/errors"
import { ServerError } from "@/types"

const Settings = () => {
   // Context hooks
   const { deleteUser, hasPassword, hasRecentLogin, logout } = useAuthContext()
   const { userProfile, removeUserProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [needsRelog, setNeedsRelog] = useState<boolean>(false)

   // Interaction states
   const [loggingOut, setLoggingOut] = useState<boolean>(false)
   const [deleting, setDeleting] = useState<boolean>(false)
   const [popupVisible, setPopupVisible] = useState<boolean>(false)

   // Custom functions triggered by interactions
   const handleLogout = async () => {
      if (!loggingOut) {
         setLoggingOut(true)

         await logout()
         removeUserProfile()

         router.push("/onboarding")
      }
   }

   const handleDeletion = async () => {
      if (!deleting && hasRecentLogin()) {
         // Delete the user's account profile and data
         setDeleting(true)

         const params: RequestInit = {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + userProfile?.sessionToken }
         }

         type ResponseType = {
            success: true
            message: undefined
         } | {
            success: undefined
            message: ServerError
         }

         fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/settings`, params)
            .then((response) => response.json())
            .then(async ({ success, message: error }: ResponseType) => {
               if (success) {
                  await deleteUser()
                  removeUserProfile()

                  router.push("/onboarding")
               } else {
                  toast.error(resolveServerError(error))
                  setDeleting(false)
               }
            })
      }
   }

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            title="Settings"
            icon={
               <IconButton
                  icon={<Cross height={24} />}
                  href={`/u/${userProfile?.userData.username!}`}
               />
            }
         />

         <div className="flex flex-grow flex-col center w-full p-8">
            <div className="flex flex-col gap-16 w-full">
               <div className="flex flex-col w-full">
                  <p className="text-base font-semibold text-gray-3 uppercase">
                     - Personal Data
                  </p>
                  <div className="flex flex-col gap-4 w-full mt-2">
                     <SettingsButton text="Personal Information" onClick={() => alert("Coming soon...")} /> {/* href="/settings/personal-information" */}
                     <SettingsButton text="Manage Interests" onClick={() => alert("Coming soon...")} /> {/* href="/settings/manage-interests" */}
                     <SettingsButton text="Terms & Conditions" onClick={() => alert("Coming soon...")} /> {/* href="/terms-conditions" */}
                  </div>
               </div>

               <div className="flex flex-col w-full">
                  <p className="text-base font-semibold text-gray-3 uppercase">
                     - Security
                  </p>
                  <div className="flex flex-col gap-4 w-full mt-2">
                     {hasPassword && <SettingsButton text="Update Password" href="/settings/update-password" />}
                     <SettingsButton
                        text={loggingOut ? "Logging out..." : "Log Out"}
                        onClick={handleLogout}
                     />
                  </div>
               </div>

               <div className="flex flex-col w-full">
                  <p className="text-base font-semibold text-red-5 uppercase">
                     - Danger Zone
                  </p>
                  <div className="flex flex-col gap-4 w-full mt-2">
                     <SettingsButton
                        text="Delete Account"
                        isDanger
                        onClick={() => {
                           setNeedsRelog(!hasRecentLogin())
                           setPopupVisible(true)
                        }}
                     />
                  </div>
               </div>
            </div>
         </div>

         {popupVisible && <FloatingConfirmation
            title="Confirm Deletion"
            text="This is a sensitive operation. If you wish to continue, make sure you have logged in recently and press confirm to complete your account's deletion."
            actionText={needsRelog ? "Relog" : deleting ? "Deleting..." : "Confirm"}
            actionColor={needsRelog || deleting ? undefined : "text-red-5"}
            action={handleDeletion}
            closePopup={() => setPopupVisible(false)}
         />}
      </div>
   )
}

export default Settings
