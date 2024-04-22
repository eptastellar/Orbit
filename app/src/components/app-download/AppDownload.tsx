"use client"

import Image from "next/image"
import Link from "next/link"
import { BrowserView } from "react-device-detect"

import { downloadApp } from "@/assets"
import { Download } from "@/assets/icons"

const AppDownload = () => (
   <BrowserView className="flex flex-grow flex-col center gap-16 w-full p-8">
      <div className="flex flex-col center gap-4 w-full">
         <Image
            src={downloadApp}
            alt="Download the mobile app"
            className="w-2/3"
         />

         <p className="text-center text-base font-semibold text-white">
            Please download the mobile app to share your QrCode.
         </p>
      </div>

      <div className="flex flex-col center gap-4 w-full">
         {/* TODO: Add Get it on the app stores */}
         <Link
            href="https://github.com/eptastellar/Orbit/releases/latest"
            target="_blank"
            className="flex flex-row center gap-2 px-4 py-2 ring-inset ring-2 ring-blue-5 hover:bg-blue-5 rounded-md transition-colors duration-200"
         >

            <Download height={16} color="fill-white" />
            <p className="text-sm font-semibold text-white">
               Latest preview version
            </p>
         </Link>
      </div>
   </BrowserView>
)

export default AppDownload
