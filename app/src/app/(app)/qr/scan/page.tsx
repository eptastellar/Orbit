"use client"

import { useRouter } from "next/navigation"
import { MobileView } from "react-device-detect"

import { Cross, IconButton, QrCode } from "@/assets/icons"
import { AppDownload, HeaderWithButton } from "@/components"

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

         <AppDownload />

         <MobileView className="flex flex-grow flex-col center gap-8 w-full p-8">
            <div className="flex flex-grow flex-col">
               {/* TODO: Actual scanning */}
            </div>

            <div
               className="absolute bottom-8 right-8 flex center p-4 bg-blue-5 rounded-full cursor-pointer"
               onClick={() => router.push("/qr/code")}
            >
               <QrCode height={32} color="fill-white" />
            </div>
         </MobileView>
      </div>
   )
}

export default QrScan
