import { CgSpinner } from "react-icons/cg"

type Props = {
   message: string
}

const SpinnerText = ({ message }: Props) => (
   <p className="flex flex-row center gap-2 text-white">
      <CgSpinner className="animate-spin" />
      <span>{` ${message}`}</span>
   </p>
)

export default SpinnerText
