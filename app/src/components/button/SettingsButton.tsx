type Props = {
   isDanger?: boolean
   text: string
   onClick: () => void
}

const SettingsButton = ({ isDanger, text, onClick }: Props) => (
   <div
      className={`w-full py-2 ring-inset ring-1 ${isDanger ? "ring-red-5" : "ring-gray-3"} bg-gray-7 rounded-md cursor-pointer`}
      onClick={onClick}
   >
      <p className={`text-center text-base ${isDanger ? "font-semibold text-red-5" : "font-normal text-white"}`}>
         {text}
      </p>
   </div>
)

export default SettingsButton
