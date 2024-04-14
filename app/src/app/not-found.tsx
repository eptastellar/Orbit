import { BackButton } from "@/components"

const NotFound = () => (
   <div className="flex flex-col center gap-12 h-screen w-screen p-8">
      <div>
         <h1 className="text-9xl font-black text-black text-stroke">
            404
         </h1>
         <p className="text-center text-base text-white">
            page not found.
         </p>
      </div>

      <BackButton colors="text-black bg-white" />
   </div>
)

export default NotFound
