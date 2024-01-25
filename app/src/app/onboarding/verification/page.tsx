"use client"

import Image from "next/image"

import { emailVerification } from "@/assets"

const Verification = () => (
   <div className="flex flex-col items-center justify-between h-full w-full px-8">
      <div className="flex flex-col gap-1.5 center mt-32">
         <h1 className="text-4xl font-bold text-white">
            Email verification
         </h1>
         <p className="text-sm font-medium text-gray-3">
            Please verify your email in order to continue
         </p>
      </div>

      <div className="flex flex-col center gap-8 w-full">
         <Image
            src={emailVerification}
            alt="Email sent illustration"
            className="w-3/4"
         />
         <p className="text-center text-base font-medium text-gray-3">
            An email with a link has been sent to <br />
            verify your identity. Check your inbox <br />
            for further instructions.
         </p>
      </div>

      <button
         type="submit"
         className="w-full mb-12 py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
         onClick={() => window.location.reload()}
      >
         Refresh
      </button>
   </div>
)

export default Verification
