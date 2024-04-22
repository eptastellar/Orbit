"use client"

import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { MobileView } from "react-device-detect"
import { QRCode as UserCode } from "react-qrcode-logo"
import { toast } from "react-toastify"

import { Cross, IconButton } from "@/assets/icons"
import { AppDownload, HeaderWithButton } from "@/components"
import { useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/errors"

import { generateQrCode } from "./requests"

const QrCode = () => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Interaction states
   const [timeLeft, setTimeLeft] = useState<number>()

   // Async query loading/error states
   const { data: fetchedQrCode, error: qrCodeError, refetch } = useQuery({
      queryKey: ["qrcode"],
      queryFn: () => generateQrCode(userProfile?.sessionToken!),

      retry: false
   })

   useEffect(() => {
      if (qrCodeError) toast.error(resolveServerError(qrCodeError.message))
   }, [qrCodeError])

   useEffect(() => {
      const interval = setInterval(() => {
         if (fetchedQrCode)
            setTimeLeft(Math.ceil((fetchedQrCode.expireTime - Date.now()) / 1000))
      }, 1000)

      return () => clearInterval(interval)
   }, [fetchedQrCode])

   // QrCode configuration
   const [qrSize, setQrSize] = useState<number>(0)
   const qrcodeContainer = useRef<HTMLDivElement>(null)

   useEffect(() => {
      if (qrcodeContainer.current)
         setQrSize(qrcodeContainer.current.clientWidth)
   }, [qrcodeContainer.current])

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            title="QrCode"
            icon={
               <IconButton
                  icon={<Cross height={24} />}
                  onClick={() => router.push("/")}
               />
            }
         />

         <AppDownload />

         <MobileView className="flex flex-grow flex-col center gap-8 w-full p-8">
            <div className="flex flex-grow flex-col center gap-8 w-full">
               <div className="w-full p-8 bg-gray-7/50 rounded-2xl">
                  <div ref={qrcodeContainer} className="relative w-full">
                     {fetchedQrCode
                        ? <UserCode
                           value={fetchedQrCode?.qrCode}
                           qrStyle="dots"
                           eyeRadius={16}

                           bgColor="transparent"
                           fgColor="#1D5C96"

                           ecLevel="H"
                           quietZone={0}
                           size={qrSize}
                        />
                        : <div className="aspect-square w-full bg-gray-7 loader-pulse rounded-2xl" />
                     }

                     <div className="absolute top-0 left-0 flex center h-full w-full">
                        <div className="relative min-h-24 max-h-24 min-w-24 max-w-24 rounded-full overflow-hidden">
                           <Image
                              src={userProfile!.userData.profilePicture}
                              alt="Profile picture"
                              fill className="object-cover"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col center mt-8">
                     <p className="text-2xl font-semibold text-white">
                        {userProfile!.userData.displayName}
                     </p>
                     <p className="text-base font-semibold text-gray-3">
                        {userProfile!.userData.username}
                     </p>
                  </div>
               </div>

               <p className="text-center text-sm font-normal text-white">
                  {timeLeft !== undefined
                     ? timeLeft > 0
                        ? `This QrCode will be valid for ${timeLeft} seconds.`
                        : <>
                           {"This QrCode has expired."} <br />
                           <span
                              className="text-sm font-normal text-blue-5"
                              onClick={() => refetch()}
                           >
                              Generate a new one.
                           </span>
                        </>
                     : "Generating a fresh QrCode..."
                  }
               </p>
            </div>

            <div className="flex flex-row center w-full">
               <p className="text-sm font-semibold text-white">
                  Powered by Orbit.
               </p>
            </div>
         </MobileView>
      </div>
   )
}

export default QrCode
