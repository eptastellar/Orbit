"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { supernovaRejected } from "@/assets"

const SupernovaRefused = () => {
   // Next router for navigation
   const router = useRouter()

   return (
      <div className="flex flex-col items-center justify-between h-full w-full p-8">
         <p className="text-3xl text-white font-bold mt-3">DENIED!</p>
         <div className="flex center flex-col gap-8 w-full">
            <Image
               src={supernovaRejected}
               alt="Supernova rejected"
               className="w-3/4"
            />
            <div className="flex flex-col center">
               <p className="text-white font-bold text-18px">You denied a friend request!</p>
               <p className="text-gray-5 font-medium text-sm">You and { } will not be friends!</p>
            </div>
         </div>
         <button
            className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
            onClick={() => router.push("/")}
         >
            Go back to Home
         </button>
      </div>
   )
}

export default SupernovaRefused
