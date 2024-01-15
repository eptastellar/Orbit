import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { useState } from "react"
import { PiCameraPlus } from "react-icons/pi"
import { useNavigate } from "react-router-dom"

import { BackButton, Input, SpinnerText } from "@/components"
import { Wrapper } from "@/hoc"
import { storage } from "@/libraries/firebase"
import { resolveServerError } from "@/libraries/serverErrors"

const Profile = () => {
   const navigateTo = useNavigate()

   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")
   const [progress, setProgress] = useState<number>(0)

   const [pfpUrl, setPfpUrl] = useState<string>(localStorage.getItem("profilePicture") ?? "")
   const [username, setUsername] = useState<string>(localStorage.getItem("username") ?? "")
   const [birthdate, setBirthdate] = useState<string>(localStorage.getItem("birthdate") ?? "")

   const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files ? event.target.files[0] : null

      if (file) {
         setPfpUrl("")
         localStorage.removeItem("profilePicture")

         const uploadTask = uploadBytesResumable(ref(storage, `uploads/pfps/${crypto.randomUUID()}`), file)

         uploadTask.on("state_changed",
            (snapshot) => setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => setError(error.message),
            () => getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
               localStorage.setItem("profilePicture", downloadURL)
               setPfpUrl(downloadURL)
            })
         )
      }
   }

   const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.value.startsWith("@")) setUsername("@" + event.target.value)
      else setUsername(event.target.value)
   }

   const updateBirthdate = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value.length < birthdate.length) setBirthdate(event.target.value)
      else if (event.target.value.length <= 10) {
         if (event.target.value.length === 4) setBirthdate(event.target.value + "/")
         else if (event.target.value.length === 7) {
            if (event.target.value.endsWith("/") || event.target.value.endsWith(" "))
               setBirthdate(event.target.value.substring(0, 5) + "0" + event.target.value.substring(5, 6) + "/")
            else setBirthdate(event.target.value + "/")
         }
         else if (event.target.value.length === 7) setBirthdate(event.target.value + "/")
         else setBirthdate(event.target.value)
      }
   }

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      if (birthdate.length !== 10)
         return setError("Invalid birthdate.")

      setLoading(true)

      try {
         const unixBirthdate = Math.floor(new Date(birthdate).getTime() / 1000)
         if (!unixBirthdate) return setError("Invalid birthdate.")

         // Check form validity with api endpoint
         const requestBody = JSON.stringify({
            username: username,
            bday: unixBirthdate
         })

         const params: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody
         }

         type ResponseType = { success: boolean, message: string }
         fetch(`${import.meta.env.VITE_API_URL}/auth/sign-up/validate`, params)
            .then((response) => response.json())
            .then(({ success, message }: ResponseType) => {
               if (success) {
                  setError("")

                  localStorage.setItem("username", username)
                  localStorage.setItem("birthdate", birthdate)
                  navigateTo("/onboarding/interests")
               } else setError(resolveServerError(message))
            })
            .finally(() => setLoading(false))
      } catch (error: any) {
         setError(error.message)
         setLoading(false)
      }
   }

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               About you
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Let others know more about yourself
            </p>
         </div>

         <form
            className="flex flex-col center gap-4 w-full"
            onSubmit={handleSubmit}
         >
            <label
               className={`flex center h-32 w-32 ${progress === 0 ? "p-[1px]" : "p-1"} rounded-full transition-all duration-500 cursor-pointer`}
               style={{
                  background: pfpUrl ? "#1D5C96" :
                     `conic-gradient(#1D5C96 0deg, #1D5C96 ${Math.floor(progress * 3.6)}deg, #585858 ${Math.floor(progress * 3.6)}deg)`
               }}
            >
               <div className="flex center h-full w-full bg-gray-7 rounded-full overflow-hidden">
                  {pfpUrl ? (
                     <img src={pfpUrl} alt="Profile picture" className="h-full w-full object-cover" />
                  ) : (
                     <PiCameraPlus className="text-white text-5xl" />
                  )}
               </div>
               <input
                  type="file"
                  accept="image/gif, image/jpeg, image/png"
                  onChange={handleUpload}
                  className="hidden"
               />
            </label>

            <Input
               label="Username"
               placeholder="@4stroNebul4"
               type="text"
               value={username}
               onChange={updateUsername}
            />
            <div className="flex flex-col items-end justify-center gap-1 w-full">
               <Input
                  label="Birthdate"
                  placeholder="YYYY / MM / DD"
                  type="text"
                  value={birthdate}
                  onChange={(event) => updateBirthdate(event)}
               />
               <p className="text-[10px] font-medium text-gray-3">
                  You won't be able to change this later.
               </p>
            </div>

            <p className="text-center text-red-5">{error}</p>

            <button
               type="submit"
               className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
            >
               {loading ? <SpinnerText message="Building your rocket..." /> : <p>Save your profile</p>}
            </button>
         </form>

         <div /> {/* For spacing */}

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Wrapper({ children: <Profile />, needsAuth: true })
