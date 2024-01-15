import { Wrapper } from "@/hoc"

const Verification = () => (
   <div className="flex center h-full w-full">
      <p className="text-white">Verification</p>
   </div>
)

export default Wrapper({ children: <Verification />, needsAuth: true, isConfirmPage: true })
