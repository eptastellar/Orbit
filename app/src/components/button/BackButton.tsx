"use client"

import { useRouter } from "next/navigation"
import { PiArrowLeftBold } from "react-icons/pi"

type Props = {
   colors?: string
   text?: string
}

const BackButton = ({ colors = "text-white bg-blue-7", text = "Back" }: Props) => {
   const router = useRouter()

   return (
      <button
         className={`flex gap-2 center px-4 py-2 ${colors} rounded-md cursor-pointer`}
         onClick={() => router.back()}
      >
         <PiArrowLeftBold />
         <p className="text-base font-semibold">{text}</p>
      </button>
   )
}

export default BackButton
