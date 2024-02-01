"use client"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import { logoWhite } from "@/assets"
import { Home, IconButton, Notifications, PlusCircle, QrCode } from "@/assets/icons"

const Navbar = () => {
   // Route path and router navigation
   const pathname = usePathname()
   const router = useRouter()

   return (
      <div className="flex flex-row items-center justify-between w-full px-8 py-4 text-white border-t border-gray-7 bg-black z-10">
         <IconButton
            icon={<Home height={24} fill={pathname === "/"} />}
            onClick={() => router.push("/")}
         />
         <IconButton
            icon={<PlusCircle height={24} fill={pathname === "/new-post"} />}
            onClick={() => router.push("/new-post")}
         />
         <IconButton
            icon={<QrCode height={24} fill={pathname === "/qr-scan"} />}
            onClick={() => router.push("/qr-scan")}
         />
         <IconButton
            icon={<Notifications height={24} fill={pathname === "/notifications"} />}
            onClick={() => router.push("/notifications")}
         />

         {/* TODO: Fix user link and src with actual user pfp */}
         <div
            className="flex center h-6 w-6 rounded-full overflow-hidden cursor-pointer"
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
