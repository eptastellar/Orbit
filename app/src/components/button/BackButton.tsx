"use client"

import { useRouter } from "next/navigation"

import { ArrowLeft } from "@/assets/icons"

type Props = {
   colors?: string
   text?: string
}

const BackButton = ({ colors = "text-white bg-blue-7", text = "Back" }: Props) => {
   // Next router for navigation
   const router = useRouter()

   return (
      <button
         className={`flex gap-2 center px-4 py-2 ${colors} rounded-md cursor-pointer`}
         onClick={() => router.back()}
      >
         <ArrowLeft height={12} />
         <p className="text-base font-semibold">{text}</p>
      </button>
   )
}

export default BackButton
