import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Metadata } from "next"
import Image from "next/image"

import { rotateDevice } from "@/assets"
import { Providers } from "@/contexts"

import "./globals.css"

export const metadata: Metadata = {
   title: "Orbit",
   description: "The social to stay close to your friends."
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
   <html lang="en-US">
      <body className="relative overflow-x-hidden">
         <div id="overflow-height">
            <Image
               src={rotateDevice}
               alt="Rotate device illustration"
               className="h-1/3"
            />
            <p className="text-xl font-semibold text-white">
               Please rotate your device
            </p>
         </div>

         <Providers>
            {children}
         </Providers>

         <Analytics debug={false} />
         <SpeedInsights debug={false} />
      </body>
   </html>
)

export default RootLayout
