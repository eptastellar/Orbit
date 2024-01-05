import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { BackButton, Input, SpinnerText } from "@/components"
import { useAuthContext } from "@/contexts"
import { Wrapper } from "@/hoc"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"

const Signin = () => {
   const { emailSignin } = useAuthContext()

   const navigateTo = useNavigate()

   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   const [email, setEmail] = useState<string>("")
   const [password, setPassword] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      setLoading(true)

      try {
         await emailSignin(email, password)
         navigateTo("/")
      } catch (error: any) { setError(error.message) }

      setLoading(false)
   }

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               Sign in
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Access your space account
            </p>
         </div>

         <div className="flex flex-col center gap-4 w-full">
            <form
               className="flex flex-col w-full gap-4"
               onSubmit={(event) => handleSubmit(event)}
            >
               <Input
                  label="Your personal email"
                  placeholder="astro@email.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
               />
               <Input
                  label="Your password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
               />

               <p className="text-center text-red-5">
                  {error && resolveFirebaseError(error)}
               </p>

               <button
                  type="submit"
                  className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
               >
                  {loading ? <SpinnerText message="Building your rocket..." /> : <p>Join the galaxy</p>}
               </button>
            </form>

            <p className="text-base font-medium text-gray-3">
               Don't have an account? {" "}
               <span
                  className="font-bold text-white underline underline-offset-4"
                  onClick={() => navigateTo("/onboarding/signup")}
               >
                  Sign up.
               </span>
            </p>
         </div>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Wrapper({ children: <Signin /> })
