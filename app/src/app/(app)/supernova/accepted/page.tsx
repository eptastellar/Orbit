"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { supernovaAccepted } from "@/assets"
import { HandWave, Spinner } from "@/assets/icons"

const SupernovaAccepted = () => {
   // Next router for navigation
   const router = useRouter()

   // Interaction states
   const [message, setMessage] = useState<string>("")
   const [loading, setLoading] = useState<boolean>(false)

   // Custom functions triggered by interactions
   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      // Preliminary checks
      if (!message) return toast.error("Please write a message.")

      // TODO: Implement actual message sending
      setLoading(true)

      setTimeout(() => {
         setLoading(false)
         router.push("/")
      }, 500)
   }

   return (
      <div className="flex flex-col between gap-16 h-full w-full p-8">
         <h1 className="mt-16 text-4xl font-bold text-white">
            Accepted!
         </h1>

         <div className="flex flex-col center gap-8 w-full">
            <Image
               src={supernovaAccepted}
               alt="Supernova accepted illustration"
               className="w-3/4"
            />

            <div className="flex flex-col center gap-2 w-full">
               <p className="text-center text-base font-semibold text-white">
                  You made a new friend in the stars!
               </p>
               <p className="text-center text-base font-medium text-gray-3">
                  From now on, you’ll be able to conversate
                  with {"@handle" /* TODO: Actual handle */}, make sure to be nice!
               </p>
            </div>
         </div>

         <form className="relative w-full" onSubmit={handleSubmit}>
            <input
               type="text"
               placeholder="Write something..."
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className="w-full pl-4 pr-14 py-3 text-sm font-medium text-white placeholder:text-gray-3 bg-gray-7 ring-1 ring-gray-5 rounded-xl"
            />
            <div className="absolute top-2.5 right-4">
               {loading
                  ? <Spinner height={24} color="fill-white" />
                  : <HandWave height={24} color="fill-[#DA9D00]" />
               }
            </div>
         </form>
      </div>
   )
}

export default SupernovaAccepted
