import { LoaderFunction, redirect } from "react-router-dom"

const protectedLoader: LoaderFunction = () => {
   return redirect("/onboarding")
}

export default protectedLoader
