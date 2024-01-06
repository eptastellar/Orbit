import { useState } from "react"

import { BackButton, Input, SpinnerText } from "@/components"
import { useAuthContext } from "@/contexts"
import { Wrapper } from "@/hoc"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"

const ForgotPassword = () => {
   const { resetUserPassword } = useAuthContext()

   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")
   const [success, setSuccess] = useState<boolean>(false)

   const [email, setEmail] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      setLoading(true)

      try {
         await resetUserPassword(email)
         setError("")
         setSuccess(true)
      } catch (error: any) {
         setError(error.message)
         setSuccess(false)
      }

      setLoading(false)
   }

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               Forgot password
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Mayday Houston, I forgot my password
            </p>
         </div>

         <div className="flex flex-col center gap-16 w-full">
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

               <p className="text-center text-red-5">
                  {error && resolveFirebaseError(error)}
               </p>

               <button
                  type="submit"
                  className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
               >
                  {loading ? <SpinnerText message="Asking Houston..." /> : <p>Send a reset email</p>}
               </button>
            </form>

            {success && (
               <p className="text-center text-base font-medium text-gray-3">
                  A password reset email has been sent. <br />
                  Check your email for further instructions!
               </p>
            )}
         </div>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Wrapper({ children: <ForgotPassword /> })
