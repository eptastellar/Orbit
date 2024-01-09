import { PiArrowLeft } from "react-icons/pi"
import { useNavigate } from "react-router-dom"

const BackButton = () => {
   const navigateTo = useNavigate()

   return (
      <div
         className="flex center gap-2 px-4 py-2 text-white bg-blue-7 rounded-md cursor-pointer"
         onClick={() => navigateTo(-1)}
      >
         <PiArrowLeft />
         <p className="text-base font-semibold">Back</p>
      </div>
   )
}

export default BackButton
