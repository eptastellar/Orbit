"use client"

import { randomBytes } from "crypto"
import { StorageReference, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import { CameraPlus } from "@/assets/icons"
import { BackButton, FullInput, Input, LargeButton } from "@/components"
import { useLocalStorage } from "@/hooks"
import { resolveFirebaseError, resolveServerError } from "@/libraries/errors"
import { storage } from "@/libraries/firebase"
import { ServerError } from "@/types"

const Profile = () => {
   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [uploading, setUploading] = useState<boolean>(false)
   const [uploadProgress, setUploadProgress] = useState<number>(0)

   // Interaction states
   const [dbRef] = useState<StorageReference>(ref(storage, `uploads/pfps/${randomBytes(16).toString("hex")}`))

   const [pfpUrl, setPfpUrl] = useLocalStorage<string>("profilePicture", "")
   const [username, setUsername] = useLocalStorage<string>("username", "")
   const [birthdate, setBirthdate] = useLocalStorage<string[]>("birthdate", ["", "", ""])

   const [bdayYear, setBdayYear] = useState<string>("")
   const [bdayMonth, setBdayMonth] = useState<string>("")
   const [bdayDay, setBdayDay] = useState<string>("")

   const yearRef = useRef<HTMLInputElement>(null)
   const monthRef = useRef<HTMLInputElement>(null)
   const dayRef = useRef<HTMLInputElement>(null)

   useEffect(() => {
      setBdayYear(birthdate[0] ?? "")
      setBdayMonth(birthdate[1] ?? "")
      setBdayDay(birthdate[2] ?? "")
   }, [birthdate])

   // Custom functions triggered by interactions
   const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!uploading) {
         const file = event.target.files ? event.target.files[0] : null

         if (file && ["image/gif", "image/jpeg", "image/png"].includes(file.type)) {
            setPfpUrl("")
            setUploading(true)

            const uploadTask = uploadBytesResumable(dbRef, file)

            uploadTask.on("state_changed",
               (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
               (error) => toast.error(resolveFirebaseError(error.message)),
               () => getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  setPfpUrl(downloadURL)
                  setUploading(false)
               })
            )
         }
      }
   }

   const updateUsername = (value: string) => {
      if (value.substring(1).match(/[^a-zA-Z0-9\_\-\.]/)) return

      if (!value.startsWith("@")) setUsername("@" + value)
      else setUsername(value)
   }

   const updateBirthdate = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (value !== "" && (isNaN(parseInt(value)) || parseInt(value) < 0)) return

      const currentYear = new Date().getFullYear()
      if (event.target === yearRef.current && (value === "" || parseInt(value) <= currentYear)) {
         setBdayYear(value)
         setBirthdate((prev) => [value, prev[1], prev[2]])
         if (value.length === 4) monthRef.current?.focus()
      } else if (event.target === monthRef.current && (value === "" || parseInt(value) <= 12)) {
         setBdayMonth(value)
         setBirthdate((prev) => [prev[0], value, prev[2]])
         if (value.length === 2) dayRef.current?.focus()
      } else if (event.target === dayRef.current && (value === "" || parseInt(value) <= 31)) {
         setBdayDay(value)
         setBirthdate((prev) => [prev[0], prev[1], value])
      }
   }

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      if (!username) return toast.info("Please fill in the username.")
      if (!birthdate[0] || !birthdate[1] || !birthdate[2] || birthdate[0].length !== 4)
         return toast.info("Please fill in all birthdate fields.")

      const unixBirthdate = Math.floor(new Date(birthdate.join("/")).getTime() / 1000)
      if (!unixBirthdate) return toast.warn("Invalid birthdate provided.")

      // Check form validity with api endpoint
      setLoading(true)

      const requestBody = JSON.stringify({
         username: username,
         bday: unixBirthdate
      })

      const params: RequestInit = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: requestBody
      }

      type ResponseType = {
         message?: ServerError
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up/validate`, params)
         .then((response) => response.json())
         .then(({ message: error }: ResponseType) => {
            if (!error) {
               router.push("/onboarding/interests")
            } else {
               toast.error(resolveServerError(error))
               setLoading(false)
            }
         })
   }

   return (
      <div className="flex flex-col between gap-16 h-full w-full p-8">
         <div className="flex flex-col center gap-2 mt-16">
            <h1 className="text-4xl font-bold text-white">
               About you
            </h1>
            <p className="text-sm font-semibold text-gray-3">
               Let others know more about yourself
            </p>
         </div>

         <form className="flex flex-col center gap-4 w-full">
            <label
               className={`flex center min-h-32 min-w-32 ${uploadProgress === 0 && !pfpUrl ? "p-[1px]" : "p-1"} rounded-full transition-all duration-500 cursor-pointer`}
               style={{
                  background: pfpUrl ? "#1D5C96" :
                     `conic-gradient(#1D5C96 0deg, #1D5C96 ${Math.floor(uploadProgress * 3.6)}deg, #585858 ${Math.floor(uploadProgress * 3.6)}deg)`
               }}
            >
               <div className="flex center h-32 w-32 bg-gray-7 rounded-full overflow-hidden">
                  {pfpUrl
                     ? <div className="relative min-h-32 max-h-32 min-w-32 max-w-32 rounded-full overflow-hidden">
                        <Image
                           src={pfpUrl}
                           alt="Profile picture"
                           fill className="object-cover"
                        />
                     </div>
                     : <CameraPlus color="fill-white" height={32} />
                  }
               </div>
               <input
                  type="file"
                  accept="image/gif, image/jpeg, image/png"
                  onChange={handleUpload}
                  disabled={uploading}
                  hidden
               />
            </label>

            <FullInput
               label="Username"
               placeholder="@4stroNebul4"
               type="text"
               value={username}
               onChange={updateUsername}
            />
            <div className="flex flex-col items-end justify-center gap-1 w-full">
               <div className="flex flex-col gap-2 w-full">
                  <p className="text-base font-semibold text-white">Birthdate</p>
                  <div className="flex gap-2 w-full">
                     <div className="w-1/2">
                        <Input
                           ref={yearRef}
                           type="text"
                           placeholder="YYYY"
                           value={bdayYear}
                           changeEvent
                           onChange={updateBirthdate}
                        />
                     </div>
                     <div className="flex gap-2 w-1/2">
                        <Input
                           ref={monthRef}
                           type="text"
                           placeholder="MM"
                           value={bdayMonth}
                           changeEvent
                           onChange={updateBirthdate}
                        />
                        <Input
                           ref={dayRef}
                           type="text"
                           placeholder="DD"
                           value={bdayDay}
                           changeEvent
                           onChange={updateBirthdate}
                        />
                     </div>
                  </div>
               </div>
               <p className="text-[10px] font-medium text-gray-3">
                  You won't be able to change this later.
               </p>
            </div>

            <LargeButton
               text="Save your profile"
               loading={loading}
               loadingText="Building your rocket..."
               submitBtn
               onClick={handleSubmit}
            />
         </form>

         <BackButton />
      </div>
   )
}

export default Profile
