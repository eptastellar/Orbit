"use client"

import { SpinnerText } from "@/components"

type Props = {
   text: string
   background?: string
   loading?: boolean
   loadingText?: string
   onClick: () => void
}

const LargeButton = ({ text, background, loading, loadingText, onClick }: Props) => (
   <div
      className={`flex center w-full py-2 text-base font-semibold text-white ${background ? background : "bg-blue-7"} rounded-md`}
      onClick={onClick}
   >
      {loading && loadingText
         ? <SpinnerText message={loadingText} />
         : <p>{text}</p>
      }
   </div>
)

export default LargeButton
