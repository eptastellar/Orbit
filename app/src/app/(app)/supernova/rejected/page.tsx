"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { supernovaRejected } from "@/assets"
import { LargeButton } from "@/components"

const SupernovaRejected = () => {
   // Next router for navigation
   const router = useRouter()

   return (
      <div className="flex flex-col between gap-16 h-full w-full p-8">
         <h1 className="mt-16 text-4xl font-bold text-white">
            Rejected!
         </h1>

         <div className="flex flex-col center gap-8 w-full">
            <Image
               src={supernovaRejected}
               alt="Supernova accepted illustration"
               className="w-3/4"
            />

            <div className="flex flex-col center gap-2 w-full">
               <p className="text-center text-base font-semibold text-white">
                  You rejected your supernova.
               </p>
               <p className="text-center text-base font-medium text-gray-3">
                  You and {"@handle" /* TODO: Actual handle */} will not be friends.
               </p>
            </div>
         </div>

         <LargeButton text="Return to the homepage" onClick={() => router.push("/")} />
      </div>
   )
}

export default SupernovaRejected
