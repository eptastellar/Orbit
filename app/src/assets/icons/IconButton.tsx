type Props = {
   icon: JSX.Element
   onClick: (event: React.PointerEvent<HTMLDivElement>) => void
}

const IconButton = ({ icon, onClick }: Props) => (
   <div className="cursor-pointer" onClick={onClick}>
      {icon}
   </div>
)

export default IconButton
