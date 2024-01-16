import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BackButton, Input, InterestButton, SpinnerText } from "@/components"
import { useAuthContext } from "@/contexts"
import { Wrapper } from "@/hoc"
import { resolveServerError } from "@/libraries/serverErrors"

const Interests = () => {
   // Context hooks
   const { getUserId } = useAuthContext()

   const navigateTo = useNavigate()

   // Fetching and async states
   const [fetching, setFetching] = useState<boolean>(true)
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   // Interaction states
   const [interests, setInterests] = useState<string[]>([])
   const [interestsList, setInterestsList] = useState<string[]>([])
   const [interestsShown, setInterestsShown] = useState<string[]>([])
   const [searchQuery, setSearchQuery] = useState<string>("")

   const filterInterestsShown = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)

      if (!event.target.value) return randomizeInterestsShown(interestsList)

      const filtered = interestsList
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
      randomizeInterestsShown(interestsList)
   }

   const handleInterestListClick = (interest: string) => {
      if (interests.length < 5) {
         setSearchQuery("")
         setInterests((prev) => [...prev, interest].sort())
         randomizeInterestsShown(interestsList)
         document.getElementById("search-box")?.focus()
      }
   }

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      // Preliminary checks
      const profilePicture = localStorage.getItem("profilePicture")
      const username = localStorage.getItem("username")
      const birthdate = localStorage.getItem("birthdate")

      if (!username || !birthdate)
         return navigateTo("/onboarding/profile")

      const unixBirthdate = Math.floor(new Date(birthdate).getTime() / 1000)
      if (!unixBirthdate) return navigateTo("/onboarding/profile")

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
         message: string
         jwt: string
         username: string
      }
      fetch(`${import.meta.env.VITE_API_URL}/auth/sign-up`, params)
         .then((response) => response.json())
         .then(({ success, message, jwt, username }: ResponseType) => {
            if (success) {
               setError("")

               localStorage.setItem("sessionToken", jwt)

               // Remove temporary user localStorage values
               localStorage.removeItem("profilePicture")
               localStorage.removeItem("username")
               localStorage.removeItem("birthdate")
               navigateTo(`/u/${username}`)
            } else setError(resolveServerError(message))
         })
         .finally(() => setLoading(false))
   }

   // Load all interests on page load
   useEffect(() => {
      const params: RequestInit = { method: "GET" }

      type ResponseType = { interests: string[] }
      fetch(`${import.meta.env.VITE_API_URL}/interests`, params)
         .then((response) => response.json())
         .then(({ interests }: ResponseType) => {
            setInterestsList(interests)
            randomizeInterestsShown(interests)
         })
         .catch((error: any) => setError(error.error))
         .finally(() => setFetching(false))
   }, [])

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
                  {fetching ? (
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
                  onClick={() => navigateTo("/terms-conditions")}
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

export default Wrapper({ children: <Interests />, firebaseAuth: true })
