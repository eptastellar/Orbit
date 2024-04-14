import { Spinner } from "@/assets/icons"

type Props = {
   message: string
}

const SpinnerText = ({ message }: Props) => (
   <p className="flex flex-row center gap-2 text-white">
      <Spinner height={12} />
      <span>{message}</span>
   </p>
)

export default SpinnerText
