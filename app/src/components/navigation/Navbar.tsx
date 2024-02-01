"use client"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { BiMeteor, BiSolidMeteor } from "react-icons/bi"
import { PiHorseBold, PiHouseFill, PiPlusCircleBold, PiPlusCircleFill, PiQrCodeBold, PiQrCodeFill } from "react-icons/pi"

import { logoWhite } from "@/assets"

const Navbar = () => {
   // Route path and router navigation
   const pathname = usePathname()
   const router = useRouter()

   return (
      <div className="flex device:hidden flex-row items-center justify-between w-full px-8 py-4 border-t border-gray-7 bg-black z-10">
         {
            pathname === "/"
               ? <PiHouseFill className="text-3xl text-white cursor-pointer" />
               : <PiHorseBold
                  className="text-3xl text-white cursor-pointer"
                  onClick={() => router.push("/")}
               />
         }
         {
            pathname === "/new-post"
               ? <PiPlusCircleFill className="text-3xl text-white cursor-pointer" />
               : <PiPlusCircleBold
                  className="text-3xl text-white cursor-pointer"
                  onClick={() => router.push("/new-post")}
               />
         }
         {
            pathname === "/qr-scan"
               ? <PiQrCodeFill className="text-3xl text-white cursor-pointer" />
               : <PiQrCodeBold
                  className="text-3xl text-white cursor-pointer"
                  onClick={() => router.push("/qr-scan")}
               />
         }
         {
            pathname === "/notifications"
               ? <BiSolidMeteor className="text-3xl text-white cursor-pointer" />
               : <BiMeteor
                  className="text-3xl text-white cursor-pointer"
                  onClick={() => router.push("/notifications")}
               />
         }

         {/* TODO: Fix user link and src with actual user pfp */}
         <div
            className="flex center h-[30px] w-[30px] rounded-full overflow-hidden"
            onClick={() => router.push(`/u/${"@Test"}`)}
         >
            <Image
               src={logoWhite["64px"]}
               alt="Profile picture"
               className="h-full w-full object-cover"
            />
         </div>
      </div>
   )
}

export default Navbar
