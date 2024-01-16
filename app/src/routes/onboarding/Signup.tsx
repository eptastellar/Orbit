import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { BackButton, Input, SpinnerText } from "@/components"
import { useAuthContext } from "@/contexts"
import { Wrapper } from "@/hoc"
import { resolveFirebaseError } from "@/libraries/firebaseErrors"

const Signup = () => {
   // Context hooks
   const { emailSignup } = useAuthContext()

   const navigateTo = useNavigate()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   // Interaction states
   const [email, setEmail] = useState<string>("")
   const [password, setPassword] = useState<string>("")
   const [confirmPassword, setConfirmPassword] = useState<string>("")

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      if (password !== confirmPassword)
         return setError("Passwords do not match.")

      setLoading(true)

      emailSignup(email, password)
         .then(() => navigateTo("/onboarding/verification"))
         .catch((error: any) => setError(resolveFirebaseError(error.message)))
         .finally(() => setLoading(false))
   }

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               Join us in space
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Connect with people around the galaxy
            </p>
         </div>

         <div className="flex flex-col center gap-4 w-full">
            <form
               className="flex flex-col w-full gap-4"
               onSubmit={handleSubmit}
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
               <Input
                  label="Confirm password"
                  placeholder="SeCrE7#Pa5sW0rD"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
               />

               <p className="text-center text-red-5">{error}</p>

               <button
                  type="submit"
                  className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
               >
                  {loading ? <SpinnerText message="Building your rocket..." /> : <p>Join the galaxy</p>}
               </button>
            </form>

            <p className="text-base font-medium text-gray-3">
               Already have an account? {" "}
               <span
                  className="font-bold text-white underline underline-offset-4 cursor-pointer"
                  onClick={() => navigateTo("/onboarding/sign-in")}
               >
                  Sign in.
               </span>
            </p>
         </div>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Wrapper({ children: <Signup /> })
