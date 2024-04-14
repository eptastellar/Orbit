"use client"

import Image from "next/image"

import { emailVerification } from "@/assets"
import { LargeButton } from "@/components"

const Verification = () => (
   <div className="flex flex-col between gap-16 h-full w-full p-8">
      <div className="flex flex-col center gap-2 mt-16">
         <h1 className="text-4xl font-bold text-white">
            Email verification
         </h1>
         <p className="text-sm font-semibold text-gray-3">
            Please verify your email in order to continue
         </p>
      </div>

      <div className="flex flex-col center gap-8 w-full">
         <Image
            src={emailVerification}
            alt="Email verification illustration"
            className="w-3/4"
         />
         <p className="px-4 text-center text-base font-medium text-gray-3">
            An email with a link has been sent to
            verify your identity. Check your inbox
            for further instructions.
         </p>
      </div>

      <LargeButton text="Refresh" onClick={() => window.location.reload()} />
   </div>
)

export default Verification
