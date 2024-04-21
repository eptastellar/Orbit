"use client"

import { useRouter } from "next/navigation"

import { Cross, IconButton, QrCode } from "@/assets/icons"
import { HeaderWithButton } from "@/components"

const QrScan = () => {
   // Next router for navigation
   const router = useRouter()

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            title="QrScan"
            icon={
               <IconButton
                  icon={<Cross height={24} />}
                  onClick={() => router.push("/")}
               />
            }
         />

         <div className="flex flex-grow flex-col">
            {/* TODO: Actual scanning */}
         </div>

         <div
            className="absolute bottom-8 right-8 flex center p-4 bg-blue-5 rounded-full"
            onClick={() => router.push("/qr/code")}
         >
            <QrCode height={32} color="fill-white" />
         </div>
      </div>
   )
}

export default QrScan
