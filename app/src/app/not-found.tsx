"use client"

import { useRouter } from "next/navigation"
import { PiArrowLeftBold } from "react-icons/pi"

const ErrorPage = () => {
   // Next router for navigation
   const router = useRouter()

   return (
      <div className="flex flex-col gap-12 center h-screen w-screen px-8 bg-black">
         <div>
            <h1 className="text-9xl font-black text-black text-stroke">
               404
            </h1>
            <p className="text-center text-base text-white">
               page not found.
            </p>
         </div>

         <button
            className="flex gap-2 center w-64 px-4 py-2 text-black bg-white rounded-md cursor-pointer"
            onClick={() => router.back()}
         >
            <PiArrowLeftBold />
            <span>Go back</span>
         </button>
      </div>
   )
}

export default ErrorPage
