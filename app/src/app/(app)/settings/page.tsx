"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Cross, IconButton } from "@/assets/icons"
import { FloatingConfirmation, HeaderWithButton, SettingsButton } from "@/components"
import { useAuthContext, useUserContext } from "@/contexts"
import { ServerError } from "@/types"

const Settings = () => {
   // Context hooks
   const { deleteUser, logout } = useAuthContext()
   const { userProfile, removeUserProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Interaction states
   const [loggingOut, setLoggingOut] = useState<boolean>(false)
   const [deleting, setDeleting] = useState<boolean>(false)
   const [popupVisible, setPopupVisible] = useState<boolean>(false)

   const handleLogout = async () => {
      if (!loggingOut) {
         setLoggingOut(true)

         await logout()
         removeUserProfile()

         router.push("/onboarding")
      }
   }

   const handleDeletion = () => {
      if (!deleting) {
         setDeleting(true)

         const params: RequestInit = {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + userProfile?.sessionToken }
         }

         type ResponseType = {
            success: boolean
            message: ServerError
         }

         fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/settings`, params)
            .then((response) => response.json())
            .then(async ({ success, message }: ResponseType) => {
               if (success) {
                  await deleteUser()
                  removeUserProfile()

                  router.push("/onboarding")
               } else {
                  setDeleting(false)
                  console.error(message)
               }
            })
      }
   }

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            icon={
               <IconButton
                  icon={<Cross height={24} />}
                  onClick={() => router.back()}
               />
            }
         />

         <div className="flex flex-grow flex-col center w-full p-8">
            <div className="flex flex-col w-full gap-16">
               <div className="flex flex-col w-full">
                  <p className="text-base font-semibold text-gray-3 uppercase">
                     - Personal Data
                  </p>
                  <div className="flex flex-col gap-4 w-full mt-2">
                     <SettingsButton text="Personal Information" onClick={() => router.push("/settings/personal-information")} />
                     <SettingsButton text="Manage Interests" onClick={() => router.push("/settings/manage-interests")} />
                     <SettingsButton text="Terms & Conditions" onClick={() => router.push("/terms-conditions")} />
                  </div>
               </div>

               <div className="flex flex-col w-full">
                  <p className="text-base font-semibold text-gray-3 uppercase">
                     - Security
                  </p>
                  <div className="flex flex-col gap-4 w-full mt-2">
                     <SettingsButton text="Update Password" onClick={() => router.push("/settings/update-password")} />
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
                     <SettingsButton text="Delete Account" isDanger onClick={() => setPopupVisible(true)} />
                  </div>
               </div>
            </div>
         </div>

         {popupVisible && <FloatingConfirmation
            title="Confirm Deletion"
            text="This is a sensitive operation. If you wish to continue, please log out and back in before proceeding."
            actionText={deleting ? "Deleting..." : "Confirm"}
            actionColor={deleting ? undefined : "text-red-5"}
            action={handleDeletion}
            closePopup={() => setPopupVisible(false)}
         />}
      </div>
   )
}

export default Settings
