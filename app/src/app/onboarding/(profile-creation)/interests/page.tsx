"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { BackButton, FullInput, InterestButton, LargeButton } from "@/components"
import { useAuthContext, useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/serverErrors"
import { ServerError } from "@/types"

import { useLocalStorage } from "@/hooks"
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
   const [selectedInterests, setSelectedInterests] = useLocalStorage<string[]>("interests", [])
   const [displayedInterests, setDisplayedInterests] = useState<string[]>([])
   const [searchQuery, setSearchQuery] = useState<string>("")

   const searchRef = useRef<HTMLInputElement>(null)

   const filterDisplayedInterests = (value: string) => {
      setSearchQuery(value)

      if (!value) return randomizeDisplayedInterests(interestsList!)

      const filtered = interestsList!
         .filter((interest) =>
            interest.toLowerCase().includes(value.toLowerCase())
            && !selectedInterests.includes(interest)
         )
         .sort()
         .slice(0, 20)
      setDisplayedInterests(filtered)
   }

   const randomizeDisplayedInterests = (interests: string[]) => {
      const shuffled = interests
         .filter((interest) => !selectedInterests.includes(interest))
         .sort(() => 0.5 - Math.random())
         .slice(0, 20)
      setDisplayedInterests(shuffled)
   }

   const handleSelectedInterestClick = (interest: string) => {
      const newInterests = selectedInterests.filter((item) => item !== interest)
      setSelectedInterests(newInterests.sort())
      randomizeDisplayedInterests(interestsList!)
   }

   const handleDisplayedInterestsClick = (interest: string) => {
      if (selectedInterests.length < 5) {
         setSearchQuery("")
         setSelectedInterests((prev) => [...prev, interest].sort())
         randomizeDisplayedInterests(interestsList!)
         searchRef.current?.focus()
      }
   }

   const handleSubmit = async () => {
      // Preliminary checks
      setError("")

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

      // Send the user object to the api endpoint
      setLoading(true)

      const requestBody = JSON.stringify({
         pfp: profilePicture,
         username: username,
         bday: unixBirthdate,
         interests: selectedInterests
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
               setUserProfile({
                  profilePicture: pfp,
                  username: username,
                  sessionToken: jwt
               })

               // Remove temporary user localStorage values
               localStorage.removeItem("profilePicture")
               localStorage.removeItem("username")
               localStorage.removeItem("birthdate")
               localStorage.removeItem("interests")
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
         randomizeDisplayedInterests(interests)
         return interests
      })
   })

   useEffect(() => {
      if (interestsError) console.error(interestsError)
   }, [interestsError])

   return (
      <div className="flex flex-col between gap-16 h-full w-full p-8">
         <div className="flex flex-col center gap-2 mt-16">
            <p className="text-4xl font-bold text-white">
               Polish your profile
            </p>
            <p className="text-sm font-semibold text-gray-3">
               Let's find some matching stars
            </p>
         </div>

         <div className="flex flex-col gap-4 h-108 w-full">
            <div className="flex flex-col gap-8 w-full">
               <FullInput
                  ref={searchRef}
                  label="Search interests"
                  placeholder="Ex: Basketball, Cars, Football"
                  type="text"
                  value={searchQuery}
                  onChange={filterDisplayedInterests}
               />

               <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between">
                     <p className="text-base font-semibold text-white">
                        Your interests ({selectedInterests.length === 0 ? "5 at most" : `chosen ${selectedInterests.length}/5`})
                     </p>
                  </div>
                  <div className="flex flex-row gap-2 px-4 py-2 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md overflow-x-scroll">
                     {selectedInterests.length === 0 ? (
                        <p className="text-gray-3 cursor-default">Your interests will appear here</p>
                     ) : selectedInterests.map((interest, index) => (
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
                  ) : !displayedInterests.length ? (
                     <p className="text-gray-3">No matching interests</p>
                  ) : (
                     displayedInterests.map((interest, index) => (
                        <InterestButton
                           key={`list-${index}`}
                           interest={interest}
                           onClick={() => handleDisplayedInterestsClick(interest)}
                        />
                     ))
                  )}
               </div>
            </div>

            {error && (
               <p className="text-center text-base font-normal text-red-5">
                  {error}
               </p>
            )}

            <LargeButton
               text="Start to orbit!"
               loading={loading}
               loadingText="Building your rocket..."
               onClick={handleSubmit}
            />

            <p className="text-center text-xs text-gray-3">
               When creating an account, you accept <br />
               <span
                  className="text-semibold text-white underline underline-offset-4 cursor-pointer"
                  onClick={() => router.push("/terms-conditions")}
               >
                  Orbit’s Terms & Conditions
               </span>.
            </p>
         </div>

         <BackButton />
      </div>
   )
}

export default Interests
