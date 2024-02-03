"use client"

import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { CameraPlus } from "@/assets/icons"
import { BackButton, Input, SpinnerText } from "@/components"
import { useLocalStorage } from "@/hooks"
import { storage } from "@/libraries/firebase"
import { resolveServerError } from "@/libraries/serverErrors"

const Profile = () => {
   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")
   const [progress, setProgress] = useState<number>(0)

   // Interaction states
   const [pfpUrl, setPfpUrl] = useLocalStorage<string>("profilePicture", "")
   const [username, setUsername] = useLocalStorage<string>("username", "")
   const [birthdate, setBirthdate] = useLocalStorage<string[]>("birthdate", ["", "", ""])

   const [bdayYear, setBdayYear] = useState<string>("")
   const [bdayMonth, setBdayMonth] = useState<string>("")
   const [bdayDay, setBdayDay] = useState<string>("")

   useEffect(() => {
      setBdayYear(birthdate[0] ?? "")
      setBdayMonth(birthdate[1] ?? "")
      setBdayDay(birthdate[2] ?? "")
   }, [birthdate])


   const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files ? event.target.files[0] : null

      if (file && ["image/gif", "image/jpeg", "image/png"].includes(file.type)) {
         setPfpUrl("")

         const uploadTask = uploadBytesResumable(ref(storage, `uploads/pfps/${crypto.randomUUID()}`), file)

         uploadTask.on("state_changed",
            (snapshot) => setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => setError(error.message),
            () => getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => setPfpUrl(downloadURL))
         )
      }
   }

   const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value.substring(1).match(/[^a-zA-Z0-9\_\-\.]/)) return

      if (!event.target.value.startsWith("@")) setUsername("@" + event.target.value)
      else setUsername(event.target.value)
   }

   const updateBirthdate = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value !== "" && isNaN(parseInt(event.target.value))) return

      if (event.target.id === "birthdate-year") {
         setBdayYear(event.target.value)
         setBirthdate((prev) => [event.target.value, prev[1], prev[2]])
         if (event.target.value.length === 4) document.getElementById("birthdate-month")?.focus()
      } else if (event.target.id === "birthdate-month") {
         setBdayMonth(event.target.value)
         setBirthdate((prev) => [prev[0], event.target.value, prev[2]])
         if (event.target.value.length === 2) document.getElementById("birthdate-day")?.focus()
      } else if (event.target.id === "birthdate-day") {
         setBdayDay(event.target.value)
         setBirthdate((prev) => [prev[0], prev[1], event.target.value])
      }
   }

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      if (!username) return setError("Fill in the username.")
      if (!birthdate[0] || !birthdate[1] || !birthdate[2] || birthdate[0].length !== 4)
         return setError("Fill in all birthdate fields.")

      const unixBirthdate = Math.floor(new Date(birthdate.join("/")).getTime() / 1000)
      if (!unixBirthdate) return setError("Invalid birthdate.")

      setLoading(true)

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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up/validate`, params)
         .then((response) => response.json())
         .then(({ success, message }: ResponseType) => {
            if (success) {
               setError("")

               router.push("/onboarding/interests")
            } else {
               setError(resolveServerError(message))
               setLoading(false)
            }
         })
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
                  {pfpUrl
                     ? <Image src={pfpUrl} alt="Profile picture" height={128} width={128} className="h-full w-full object-cover" />
                     : <CameraPlus color="fill-white" height={32} />
                  }
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
               <div className="flex flex-col w-full gap-1.5">
                  <p className="text-base font-semibold text-white">Birthdate</p>
                  <div className="flex gap-2 w-full">
                     <input
                        id="birthdate-year"
                        type="text"
                        placeholder="YYYY"
                        value={bdayYear}
                        onChange={updateBirthdate}
                        className="w-1/2 px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md"
                     />
                     <div className="flex gap-2 w-1/2">
                        <input
                           id="birthdate-month"
                           type="text"
                           placeholder="MM"
                           value={bdayMonth}
                           onChange={updateBirthdate}
                           className="w-full px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md"
                        />
                        <input
                           id="birthdate-day"
                           type="text"
                           placeholder="DD"
                           value={bdayDay}
                           onChange={updateBirthdate}
                           className="w-full px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md"
                        />
                     </div>
                  </div>
               </div>
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

export default Profile
