"use client"

import { SpinnerText } from "@/components"

type Props = {
   text: string
   background?: string
   loading?: boolean
   loadingText?: string
} & ({
   submitBtn?: false
   onClick: () => void
} | {
   submitBtn: true
   onClick: (event: React.FormEvent) => void
})

const LargeButton = ({
   text,
   background = "bg-blue-7",
   loading,
   loadingText = "Loading...",
   submitBtn,
   onClick
}: Props) => (
   <button
      type={submitBtn ? "submit" : "button"}
      className={`flex center w-full py-2 text-base font-semibold text-white ${background} rounded-md`}
      onClick={onClick}
   >
      {loading
         ? <SpinnerText message={loadingText} />
         : <p>{text}</p>
      }
   </button>
)

export default LargeButton
