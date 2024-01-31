import { Analytics } from "@vercel/analytics/react"
import { Metadata } from "next"

import { Providers } from "@/contexts"

import "./globals.css"

export const metadata: Metadata = {
   title: "Orbit",
   description: "The social to stay close to your friends."
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
   <html lang="en-US">
      <body className="relative overflow-x-hidden">
         <Providers>
            {children}
         </Providers>

         <Analytics debug={false} />
      </body>
   </html>
)

export default RootLayout
