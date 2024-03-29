type Props = {
   interest: string
   onClick?: () => void
}

const InterestButton = ({ interest, onClick }: Props) => (
   <div
      className={`min-w-fit px-3 py-1 bg-blue-3 rounded-full ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
   >
      <p className="text-xs font-semibold text-black">{interest}</p>
   </div>
)

export default InterestButton
