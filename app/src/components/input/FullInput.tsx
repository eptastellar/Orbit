"use client"

import { forwardRef } from "react"

import { Input } from "@/components"

type Props = {
   label: string
   error?: string
   type: React.HTMLInputTypeAttribute
   placeholder: string
   value: string
   onChange: (value: string) => void
}

const FullInput = forwardRef<HTMLInputElement, Props>(({
   label,
   error = "",
   type,
   placeholder,
   value,
   onChange
}, ref) => (
   <div className="flex flex-col gap-1 w-full">
      <div className="flex flex-row between">
         <p className="text-base font-semibold text-white">{label}</p>
         <p className="text-base font-normal text-red-5">{error}</p>
      </div>

      <Input
         ref={ref}
         error={error}
         type={type}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
      />
   </div>
))

FullInput.displayName = "FullInput"
export default FullInput
