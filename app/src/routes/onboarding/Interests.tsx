import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BackButton, Input, InterestButton, SpinnerText } from "@/components"
import { Wrapper } from "@/hoc"

const Interests = () => {
   const navigateTo = useNavigate()

   const [fetching, setFetching] = useState<boolean>(true)
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   const [interests, setInterests] = useState<string[]>([])
   const [interestsList, setInterestsList] = useState<string[]>([])
   const [interestsShown, setInterestsShown] = useState<string[]>([])
   const [searchQuery, setSearchQuery] = useState<string>("")

   const filterInterestsShown = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)

      if (!event.target.value) return randomizeInterestsShown(interestsList)

      const filtered = interestsList
         .filter((interest) => interest.includes(event.target.value))
         .slice(0, 20)
      setInterestsShown(filtered)
   }

   const randomizeInterestsShown = (interests: string[]) => {
      const shuffled = interests.sort(() => 0.5 - Math.random())
      setInterestsShown(shuffled.slice(0, 20))
   }

   const handleSelectedInterestClick = (interest: string) => {
      const newInterests = interests.filter((item) => item !== interest)
      setInterests(newInterests)
      randomizeInterestsShown(interestsList)
   }

   const handleInterestListClick = (interest: string) => {
      if (interests.length < 5) {
         setSearchQuery("")
         setInterests((prev) => [...prev, interest])
         randomizeInterestsShown(interestsList)
      }
   }

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      setLoading(true)

      try {
         // TODO: Send user to the database
         // TODO: Clear data in localstorage
         navigateTo("/")
      } catch (error: any) { setError(error.message) }

      setLoading(false)
   }

   useEffect(() => {
      const params: RequestInit = { method: "GET" }

      type ResponseType = { interests: string[] }
      fetch(`${import.meta.env.VITE_API_URL}/interests`, params)
         .then((response) => response.json())
         .then(({ interests }: ResponseType) => {
            setInterestsList(interests)
            randomizeInterestsShown(interests)
         })
         .catch((e: any) => setError(e.error))
         .finally(() => setTimeout(() => setFetching(false), 250))
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

export default Wrapper({ children: <Interests />, needsAuth: true })
