"use client"

import Link from "next/link"
import { MobileView } from "react-device-detect"

import { Cross, IconButton, QrCode } from "@/assets/icons"
import { AppDownload, HeaderWithButton } from "@/components"

const QrScan = () => (
   <div className="flex flex-col center h-full w-full">
      <HeaderWithButton
         title="QrScan"
         icon={
            <IconButton
               icon={<Cross height={24} />}
               href="/"
            />
         }
      />

      <AppDownload />

      <MobileView className="flex flex-grow flex-col center gap-8 w-full p-8">
         <div className="flex flex-grow flex-col">
            {/* TODO: Actual scanning */}
         </div>

         <Link
            className="absolute bottom-8 right-8 flex center p-4 bg-blue-5 rounded-full cursor-pointer"
            href="/qr/code"
         >
            <QrCode height={32} color="fill-white" />
         </Link>
      </MobileView>
   </div>
)

export default QrScan
