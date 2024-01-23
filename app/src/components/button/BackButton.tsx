import { useRouter } from "next/navigation"
import { PiArrowLeft } from "react-icons/pi"

const BackButton = () => {
   const router = useRouter()

   return (
      <button
         className="flex gap-2 center px-4 py-2 text-white bg-blue-7 rounded-md cursor-pointer"
         onClick={() => router.back()}
      >
         <PiArrowLeft />
         <p className="text-base font-semibold">Back</p>
      </button>
   )
}

export default BackButton
