import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { apple, google, welcomeBg } from "@/assets"
import { WelcomeButton } from "@/components"
import { useAuthContext } from "@/contexts"
import { Wrapper } from "@/hoc"

type Views = "default" | "signin" | "signup"

const Welcome = () => {
   // Context hooks
   const { googleLogin } = useAuthContext()

   const navigateTo = useNavigate()

   // Interaction states
   const [activeView, setActiveView] = useState<Views>("default")
   const [googleLoading, setGoogleLoading] = useState<boolean>(false)

   const handleGoogleAuth = () => {
      setGoogleLoading(true)

      googleLogin() // Login with google
         .then(async (user) => { // Login with the server
            const params: RequestInit = {
               method: "GET",
               headers: { "Authorization": "Bearer " + await user.user.getIdToken() }
            }

            type ResponseType = {
               success: boolean
               message: string
               jwt: string
               username: string
            }
            fetch(`${import.meta.env.VITE_API_URL}/auth/sign-in`, params)
               .then((response) => response.json())
               .then(({ success, jwt, username }: ResponseType) => {
                  if (success) {
                     localStorage.setItem("sessionToken", jwt)
                     navigateTo(`/u/${username}`)
                  } else navigateTo("/onboarding/profile")
               })
               .catch((error: any) => console.error(error))
               .finally(() => setGoogleLoading(false))
         })
         .catch((error: any) => console.error(error))
         .finally(() => setGoogleLoading(false))
   }

   return (
      <>
         <video
            className="absolute h-full w-full object-cover"

            src={welcomeBg}
            autoPlay loop muted
         />

         <div className="absolute flex flex-col items-center justify-between h-full w-full p-8 bg-black/50">
            <p className="mt-36 text-center text-4xl font-bold text-white">
               Welcome, to your personal orbit.
            </p>

            <div className="flex flex-col gap-2 w-full center">
               {
                  activeView === "default" ? <>
                     <WelcomeButton
                        btnType="ring"
                        text="Create an account"
                        onClick={() => setActiveView("signup")}
                     />
                     <WelcomeButton
                        btnType="transparent"
                        text="Sign in"
                        onClick={() => setActiveView("signin")}
                     />
                  </> : activeView === "signin" ? <>
                     <WelcomeButton
                        btnType="white"
                        image={apple}
                        text="Sign in with Apple"
                        onClick={() => { alert("Coming soon...") }}
                     />
                     <WelcomeButton
                        btnType="white"
                        image={google}
                        text={googleLoading ? "Loading..." : "Sign in with Google"}
                        onClick={handleGoogleAuth}
                     />
                     <WelcomeButton
                        btnType="ring"
                        text="With email and password"
                        onClick={() => navigateTo("/onboarding/sign-in")}
                     />
                     <WelcomeButton
                        btnType="transparent"
                        text="Back"
                        onClick={() => setActiveView("default")}
                     />
                  </> : <>
                     <WelcomeButton
                        btnType="white"
                        image={apple}
                        text="Sign up with Apple"
                        onClick={() => { alert("Coming soon...") }}
                     />
                     <WelcomeButton
                        btnType="white"
                        image={google}
                        text={googleLoading ? "Loading..." : "Sign up with Google"}
                        onClick={handleGoogleAuth}
                     />
                     <WelcomeButton
                        btnType="ring"
                        text="With email and password"
                        onClick={() => navigateTo("/onboarding/sign-up")}
                     />
                     <WelcomeButton
                        btnType="transparent"
                        text="Back"
                        onClick={() => setActiveView("default")}
                     />
                  </>
               }
            </div>
         </div>
      </>
   )
}

export default Wrapper({ children: <Welcome /> })
