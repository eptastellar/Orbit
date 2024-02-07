"use client"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import { Home, IconButton, Notifications, PlusCircle, QrCode } from "@/assets/icons"
import { useUserContext } from "@/contexts"

const Navbar = () => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Route path and router navigation
   const pathname = usePathname()
   const router = useRouter()

   return (
      <div className="flex flex-row items-center justify-between w-full px-8 py-4 text-white border-t border-gray-7">
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

         <div
            className="flex center max-h-6 max-w-6 rounded-full overflow-hidden cursor-pointer"
            onClick={() => router.push(`/u/${userProfile!.username}`)}
         >
            <Image
               src={userProfile!.profilePicture}
               alt="Profile picture"
               height={24}
               width={24}
               className="min-h-6 min-w-6 object-cover"
            />
         </div>
      </div>
   )
}

export default Navbar
