type Props = {
   title?: string
   icon: JSX.Element
}

const HeaderWithButton = ({ title, icon }: Props) => (
   <div className="flex flex-row items-center justify-between w-full px-8 py-4 text-white border-b border-gray-7">
      <p className="text-2xl leading-6 font-semibold">
         {title ?? "Orbit"}
      </p>

      {icon}
   </div>
)

export default HeaderWithButton
