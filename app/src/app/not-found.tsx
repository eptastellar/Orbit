import { BackButton } from "@/components"

const ErrorPage = () => (
   <div className="flex flex-col gap-12 center h-screen w-screen px-8">
      <div>
         <h1 className="text-9xl font-black text-black text-stroke">
            404
         </h1>
         <p className="text-center text-base text-white">
            page not found.
         </p>
      </div>

      <BackButton colors="text-black bg-white" text="Go back" />
   </div>
)

export default ErrorPage
