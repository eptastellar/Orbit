type Props = {
   title?: string
   icon: JSX.Element
}

const HeaderWithButton = ({
   title = "Orbit",
   icon
}: Props) => (
   <div className="flex flex-row between gap-4 w-full px-8 py-4 text-white border-b border-gray-7">
      <p className="text-2xl leading-6 font-semibold">
         {title}
      </p>

      {icon}
   </div>
)

export default HeaderWithButton
