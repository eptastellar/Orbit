import { Metadata } from "next"
import Image from "next/image"

import { rotateDevice } from "@/assets"
import { Providers } from "@/contexts"

import "./globals.css"

// React-Toastify container and css classes
import { Slide, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.min.css"

// Vercel speed analytics for performance monitoring
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

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

         <ToastContainer
            position="bottom-right"
            autoClose={3000}
            draggable={false}
            pauseOnHover={false}
            theme="dark"
            transition={Slide}
         />

         <Analytics debug={false} />
         <SpeedInsights debug={false} />
      </body>
   </html>
)

export default RootLayout
