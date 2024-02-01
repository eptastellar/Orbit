"use client"

import { logoWhite } from "@/assets"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BiMeteor } from "react-icons/bi"
import { PiHouseFill, PiPlusCircleBold, PiQrCodeBold } from "react-icons/pi"

const Navbar = () => {
   const router = useRouter()

   return (
      <div className="absolute bottom-0 flex flex-row items-center justify-between w-full px-12 py-4 border-t border-gray-7">
         <PiHouseFill className="text-2xl text-white cursor-pointer" />
         <PiPlusCircleBold
            className="text-2xl text-white cursor-pointer"
            onClick={() => router.push("chats")}
         />
         <PiQrCodeBold
            className="text-2xl text-white cursor-pointer"
            onClick={() => router.push("chats")}
         />
         <BiMeteor
            className="text-2xl text-white cursor-pointer"
            onClick={() => router.push("chats")}
         />
         <div className="flex center h-6 w-6 border border-white rounded-full overflow-hidden">
            <Image src={logoWhite["64px"]} alt="Profile picture" height={24} width={24} className="h-full w-full object-cover" />
         </div>
      </div>
   )
}

export default Navbar
