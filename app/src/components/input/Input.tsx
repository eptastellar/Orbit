"use client"

import { forwardRef } from "react"

type Props = {
   error?: string
   type: React.HTMLInputTypeAttribute
   placeholder: string
   value: string
} & ({
   changeEvent?: false
   onChange: (value: string) => void
} | {
   changeEvent: true
   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
})

const Input = forwardRef<HTMLInputElement, Props>(({
   error = "",
   type,
   placeholder,
   value,
   changeEvent,
   onChange
}, ref) => (
   <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={changeEvent ? onChange : (event) => onChange(event.target.value)}
      className={`w-full px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ${error ? "ring-red-5" : "ring-gray-5"} bg-gray-7 rounded-md transition-shadow duration-200`}
   />
))

Input.displayName = "Input"
export default Input
