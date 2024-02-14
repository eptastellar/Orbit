"use client"

import { useRouter } from "next/navigation"

import { Cross, IconButton } from "@/assets/icons"
import { HeaderWithButton, SettingsButton } from "@/components"

const Settings = () => {
   // Next router for navigation
   const router = useRouter()

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
                     <SettingsButton text="Log Out" onClick={() => { /* */ }} />
                  </div>
               </div>

               <div className="flex flex-col w-full">
                  <p className="text-base font-semibold text-red-5 uppercase">
                     - Danger Zone
                  </p>
                  <div className="flex flex-col gap-4 w-full mt-2">
                     <SettingsButton text="Delete Account" isDanger onClick={() => { /* */ }} />
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Settings
