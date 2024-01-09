import { Wrapper } from "@/hoc"

const Confirmation = () => (
   <div className="flex center h-full w-full">
      <p className="text-white">Confirmation</p>
   </div>
)

export default Wrapper({ children: <Confirmation />, needsAuth: true, isConfirmPage: true })
