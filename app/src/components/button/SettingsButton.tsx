"use client"

import Link from "next/link"

type Props = {
   isDanger?: boolean
   text: string
} & ({
   href?: undefined
   onClick?: (event: React.PointerEvent<HTMLDivElement>) => void
} | {
   href: string
   onClick?: (event: React.PointerEvent<HTMLAnchorElement>) => void
})

const SettingsButton = ({ isDanger, text, href, onClick }: Props) => (
   href !== undefined ? (
      <Link
         className={`w-full py-2 ring-inset ring-1 ${isDanger ? "ring-red-5" : "ring-gray-3"} bg-gray-7 rounded-md`}
         href={href}
      >
         <p className={`text-center text-base ${isDanger ? "font-semibold text-red-5" : "font-normal text-white"}`}>
            {text}
         </p>
      </Link>
   ) : (
      <div
         className={`w-full py-2 ring-inset ring-1 ${isDanger ? "ring-red-5" : "ring-gray-3"} bg-gray-7 rounded-md cursor-pointer`}
         onClick={onClick}
      >
         <p className={`text-center text-base ${isDanger ? "font-semibold text-red-5" : "font-normal text-white"}`}>
            {text}
         </p>
      </div>
   )
)

export default SettingsButton
