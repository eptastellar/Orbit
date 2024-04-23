"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { ArrowLeft } from "@/assets/icons"

type Props = {
   text?: string
   colors?: string
   margin?: string
   href?: string
}

const BackButton = ({
   text = "Go back",
   colors = "text-white bg-blue-7",
   margin = "",
   href
}: Props) => {
   // Next router for navigation
   const router = useRouter()

   return (
      href !== undefined ? (
         <Link
            className={`flex center gap-2 ${margin} px-4 py-2 ${colors} rounded-md`}
            href={href}
         >
            <ArrowLeft height={12} />
            <p className="text-base font-semibold">{text}</p>
         </Link>
      ) : (
         <div
            className={`flex center gap-2 ${margin} px-4 py-2 ${colors} rounded-md cursor-pointer`}
            onClick={() => router.back()}
         >
            <ArrowLeft height={12} />
            <p className="text-base font-semibold">{text}</p>
         </div>
      )
   )
}

export default BackButton
