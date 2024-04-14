"use client"

import Image, { StaticImageData } from "next/image"

type Props = {
   btnType: "ring" | "transparent" | "white"
   image?: StaticImageData
   text: string
   onClick: () => void
}

const WelcomeButton = ({ btnType, image, text, onClick }: Props) => (
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

export default WelcomeButton
