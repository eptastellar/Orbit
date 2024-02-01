"use client"

import { useRouter } from "next/navigation"
import { FaExplosion } from "react-icons/fa6"
import { PiPaperPlaneTiltBold } from "react-icons/pi"

const Header = () => {
   // Next router for navigation
   const router = useRouter()

   return (
      <div className="flex device:hidden flex-row items-center justify-between w-full px-8 py-4 border-b border-gray-7 bg-black z-10">
         <p className="text-2xl font-semibold text-white">
            Orbit
         </p>

         <div className="flex flex-row gap-8">
            <FaExplosion
               className="text-2xl text-white cursor-pointer"
               onClick={() => alert("Supernova coming soon...")}
            />
            <PiPaperPlaneTiltBold
               className="text-2xl text-white cursor-pointer"
               onClick={() => router.push("/chats")}
            />
         </div>
      </div>
   )
}

export default Header
