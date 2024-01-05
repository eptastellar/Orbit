type Props = {
   error?: string
   label: string
   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
   placeholder: string
   type: React.HTMLInputTypeAttribute
   value: string
}

const Input = ({ error, label, onChange, placeholder, type, value }: Props) => (
   <div className="flex flex-col w-full gap-1.5">
      <div className="flex justify-between">
         <p className="text-base font-semibold text-white">{label}</p>
         <p className="text-base font-semibold text-red-5">{error}</p>
      </div>
      <input
         type={type}
         placeholder={placeholder}
         value={value}
         onChange={(event) => onChange(event)}
         className="px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md"
      />
   </div>
)

export default Input
