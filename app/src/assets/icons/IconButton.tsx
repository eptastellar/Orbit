type Props = {
   icon: JSX.Element
   onClick: () => void
}

const IconButton = ({ icon, onClick }: Props) => (
   <div className="cursor-pointer" onClick={onClick}>
      {icon}
   </div>
)

export default IconButton
