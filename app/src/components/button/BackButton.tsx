"use client"

import { useRouter } from "next/navigation"

import { ArrowLeft } from "@/assets/icons"

type Props = {
   text?: string
   colors?: string
   margin?: string
   destinationPage?: string
}

const BackButton = ({
   text = "Go back",
   colors = "text-white bg-blue-7",
   margin = "",
   destinationPage
}: Props) => {
   // Next router for navigation
   const router = useRouter()

   return (
      <div
         className={`flex center gap-2 ${margin} px-4 py-2 ${colors} rounded-md cursor-pointer`}
         onClick={() => destinationPage ? router.push(destinationPage) : router.back()}
      >
         <ArrowLeft height={12} />
         <p className="text-base font-semibold">{text}</p>
      </div>
   )
}

export default BackButton
