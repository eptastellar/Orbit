import { useNavigate, useRouteError } from "react-router-dom"

const ErrorPage = () => {
   const navigateTo = useNavigate()
   const error: any = useRouteError()

   return (
      <div className="flex flex-col gap-8 center h-screen w-screen p-8 bg-black">
         <h1 className="text-6xl font-bold text-white">Oops!</h1>
         <p className="text-center text-white">
            It seems like you ran into an error!
            <br />
            <span className="underline underline-offset-4">
               {error.error.message}
            </span>
         </p>

         <button
            className="px-4 py-2 bg-white text-black rounded-md"
            onClick={() => navigateTo(-1)}
         >
            Go back.
         </button>
      </div>
   )
}

export default ErrorPage
