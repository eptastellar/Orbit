"use client"

import { useRouter } from "next/navigation"

import { IconButton, PaperPlane, Supernova } from "@/assets/icons"

const Header = () => {
   // Next router for navigation
   const router = useRouter()

   return (
      <div className="flex flex-row items-center justify-between w-full px-8 py-4 text-white border-b border-gray-7 bg-black z-10">
         <p className="text-2xl leading-6 font-semibold">
            Orbit
         </p>

         <div className="flex flex-row gap-8">
            <IconButton
               icon={<Supernova height={24} />}
               onClick={() => alert("Supernova coming soon...")}
            />
            <IconButton
               icon={<PaperPlane height={24} />}
               onClick={() => router.push("/chats")}
            />
         </div>
      </div>
   )
}

export default Header
