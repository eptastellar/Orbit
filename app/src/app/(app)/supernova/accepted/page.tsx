"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { supernovaAccepted } from "@/assets"
import { Cross, HandWave } from "@/assets/icons"

const SupernovaAccepted = () => {
   // Next router for navigation
   const router = useRouter()

   // Interaction states
   const [inputValue, setInputValue] = useState("")

   return (
      <div className="relative flex flex-col items-center justify-between h-full w-full p-8">
         <div className="absolute left-8 top-8">
            <Cross
               height={24}
               color="fill-white"
            />
         </div>
         <p className="text-3xl text-white font-bold mt-8">ACCEPTED!</p>
         <div className="flex center flex-col gap-8 w-full">
            <Image
               src={supernovaAccepted}
               alt="Supernova accepted"
               className="w-3/4"
            />

            <div className="flex flex-col center">
               <p className="text-white font-bold text-lg text-center">You’ve made a new friend in the stars!  </p>
               <p className="text-gray-5 font-medium text-base text-center">From now on, you’ll be able to conversate
                  with { }, make sure to be nice!</p>
            </div>
         </div>
         <div className="flex flex-col center gap-2 w-full">
            <p className="text-gray-5 font-medium text-base">You’ve accepted { }, say something!</p>
            <div className="relative w-full">
               <input
                  type="text"
                  className="text-white bg-gray-7 w-full rounded-2xl font-medium text-sm ring-gray-5 ring-1 pl-4 pr-12 py-3 placeholder:text-gray-3"
                  value={inputValue}
                  placeholder="Write something..."
                  onChange={(e) => setInputValue(e.target.value)}
               />
               <div className="absolute top-3 right-4">
                  <HandWave
                     height={24}
                     color="fill-[#DA9D00]"
                  />
               </div>
            </div>
         </div>
      </div>
   )
}

export default SupernovaAccepted
