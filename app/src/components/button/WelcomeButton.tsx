"use client"

import Image, { StaticImageData } from "next/image"
import Link from "next/link"

type Props = {
   btnType: "ring" | "transparent" | "white"
   image?: StaticImageData
   text: string
} & ({
   href?: undefined
   onClick?: (event: React.PointerEvent<HTMLDivElement>) => void
} | {
   href: string
   onClick?: (event: React.PointerEvent<HTMLAnchorElement>) => void
})

const WelcomeButton = ({ btnType, image, text, href, onClick }: Props) => (
   href !== undefined ? (
      <Link
         className={`flex center gap-2 w-full p-3 rounded-md ${btnType === "ring" ? "ring-inset ring-2 ring-blue-5" : btnType === "white" ? "bg-white" : ""}`}
         href={href}
      >
         {image && <Image src={image} alt="Icon" height={28} width={28} />}
         <p className={`text-center text-xl ${btnType !== "transparent" ? "font-bold" : ""} ${btnType === "white" ? "text-black" : "text-white"}`}>
            {text}
         </p>
      </Link>
   ) : (
      <div
         className={`flex center gap-2 w-full p-3 rounded-md ${btnType === "ring" ? "ring-inset ring-2 ring-blue-5" : btnType === "white" ? "bg-white" : ""} cursor-pointer`}
         onClick={onClick}
      >
         {image && <Image src={image} alt="Icon" height={28} width={28} />}
         <p className={`text-center text-xl ${btnType !== "transparent" ? "font-bold" : ""} ${btnType === "white" ? "text-black" : "text-white"}`}>
            {text}
         </p>
      </div>
   )
)

export default WelcomeButton
