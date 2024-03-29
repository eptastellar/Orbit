"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { BackButton, Input, InterestButton, SpinnerText } from "@/components"
import { useAuthContext, useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/serverErrors"
import { ServerError } from "@/types"

import { fetchInterests } from "./requests"

const Interests = () => {
   // Context hooks
   const { getUserId } = useAuthContext()
   const { setUserProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   // Interaction states
   const [interests, setInterests] = useState<string[]>([])
   const [interestsShown, setInterestsShown] = useState<string[]>([])
   const [searchQuery, setSearchQuery] = useState<string>("")

   const filterInterestsShown = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)

      if (!event.target.value) return randomizeInterestsShown(interestsList!)

      const filtered = interestsList!
         .filter((interest) => interest.toLowerCase().includes(event.target.value.toLowerCase()))
         .slice(0, 20)
      setInterestsShown(filtered)
   }

   const randomizeInterestsShown = (interests: string[]) => {
      const shuffled = interests
         .sort(() => 0.5 - Math.random())
         .slice(0, 20)
      setInterestsShown(shuffled)
   }

   const handleSelectedInterestClick = (interest: string) => {
      const newInterests = interests.filter((item) => item !== interest)
      setInterests(newInterests.sort())
      randomizeInterestsShown(interestsList!)
   }

   const handleInterestListClick = (interest: string) => {
      if (interests.length < 5) {
         setSearchQuery("")
         setInterests((prev) => [...prev, interest].sort())
         randomizeInterestsShown(interestsList!)
         document.getElementById("search-box")?.focus()
      }
   }

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      const profilePicture: string | null =
         JSON.parse(localStorage.getItem("profilePicture") ?? "null")
      const username: string | null =
         JSON.parse(localStorage.getItem("username") ?? "null")

      const localBirthdate: string[] | null =
         JSON.parse(localStorage.getItem("birthdate") ?? "null")
      const birthdate = localBirthdate?.join("/")

      if (!username || !birthdate)
         return router.push("/onboarding/profile")

      const unixBirthdate = Math.floor(new Date(birthdate).getTime() / 1000)
      if (!unixBirthdate) return router.push("/onboarding/profile")

      setLoading(true)

      // Send the user object to the api endpoint
      const requestBody = JSON.stringify({
         pfp: profilePicture,
         username: username,
         bday: unixBirthdate,
         interests: interests
      })

      const params: RequestInit = {
         method: "POST",
         headers: {
            "Authorization": "Bearer " + await getUserId(true),
            "Content-Type": "application/json"
         },
         body: requestBody
      }

      type ResponseType = {
         success: boolean
         message: ServerError
         jwt: string
         pfp: string
         username: string
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`, params)
         .then((response) => response.json())
         .then(({ success, message, jwt, pfp, username }: ResponseType) => {
            if (success) {
               setError("")

               setUserProfile({
                  profilePicture: pfp,
                  username: username,
                  sessionToken: jwt
               })

               // Remove temporary user localStorage values
               localStorage.removeItem("profilePicture")
               localStorage.removeItem("username")
               localStorage.removeItem("birthdate")
               router.push(`/u/${username}`)
            } else {
               setError(resolveServerError(message))
               setLoading(false)
            }
         })
   }

   // Load all interests on page load
   const { isLoading: fetchingInterests, data: interestsList, error: interestsError } = useQuery({
      queryKey: ["interests"],
      queryFn: () => fetchInterests().then((interests) => {
         randomizeInterestsShown(interests)
         return interests
      })
   })

   useEffect(() => {
      if (interestsError) console.error(interestsError)
   }, [interestsError])

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               Polish your profile
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Let's find some matching stars
            </p>
         </div>

         <form
            className="flex flex-col gap-4 h-104 w-full"
            onSubmit={handleSubmit}
         >
            <div className="flex flex-col gap-8 w-full">
               <Input
                  id="search-box"
                  label="Search interests"
                  placeholder="Ex: Basketball, Cars, Football"
                  type="text"
                  value={searchQuery}
                  onChange={filterInterestsShown}
               />

               <div className="flex flex-col w-full gap-1.5">
                  <div className="flex justify-between">
                     <p className="text-base font-semibold text-white">
                        Your interests ({interests.length === 0 ? "5 at most" : `chosen ${interests.length}/5`})
                     </p>
                  </div>
                  <div className="flex flex-wrap gap-2 px-4 py-2 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md">
                     {interests.length === 0 ? (
                        <p className="text-gray-3 cursor-default">Your interests will appear here</p>
                     ) : interests.map((interest, index) => (
                        <InterestButton
                           key={`sel-${index}`}
                           interest={interest}
                           onClick={() => handleSelectedInterestClick(interest)}
                        />
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex-grow px-4 py-2 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md overflow-y-scroll">
               <div className="flex flex-wrap gap-2">
                  {fetchingInterests ? (
                     <p className="text-gray-3">Fetching interests...</p>
                  ) : interestsShown.map((interest, index) => (
                     <InterestButton
                        key={`list-${index}`}
                        interest={interest}
                        onClick={() => handleInterestListClick(interest)}
                     />
                  ))}
               </div>
            </div>

            <p className="text-center text-red-5">{error}</p>

            <button
               type="submit"
               className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
            >
               {loading ? <SpinnerText message="Building your rocket..." /> : <p>Start to orbit!</p>}
            </button>

            <p className="text-center text-xs text-gray-3">
               When creating an account, you accept <br />
               <span
                  className="text-semibold text-white underline underline-offset-4 cursor-pointer"
                  onClick={() => router.push("/terms-conditions")}
               >
                  Orbit’s Terms & Conditions
               </span>.
            </p>
         </form>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Interests
