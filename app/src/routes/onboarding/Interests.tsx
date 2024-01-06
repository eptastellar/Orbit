import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { BackButton, InterestButton, SpinnerText } from "@/components"
import { Wrapper } from "@/hoc"

const Interests = () => {
   const navigateTo = useNavigate()

   const [fetching, setFetching] = useState<boolean>(true)
   const [loading, setLoading] = useState<boolean>(false)
   const [error, setError] = useState<string>("")

   const [interests, setInterests] = useState<string[]>([])
   const [interestsList, setInterestsList] = useState<string[]>([])
   const [interestsShown, setInterestsShown] = useState<string[]>([])

   const updateInterestsShown = (interests: string[]) => {
      const shuffled = interests.sort(() => 0.5 - Math.random())
      setInterestsShown(shuffled.slice(0, 20))
   }

   const handleSelectedInterestClick = (interest: string) => {
      const newInterests = interests.filter((item) => item !== interest)
      setInterests(newInterests)
      updateInterestsShown(interestsList)
   }

   const handleInterestListClick = (interest: string) => {
      if (interests.length < 5) {
         setInterests((prev) => [...prev, interest])
         updateInterestsShown(interestsList)
      }
   }

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()

      setLoading(true)

      try {
         // TODO: Send interests to the database
         navigateTo("/onboarding/personalization")
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
            updateInterestsShown(interests)
         })
         .catch((e: any) => setError(e.error))
         .finally(() => setTimeout(() => setFetching(false), 250))
   }, [])

   return (
      <div className="flex flex-col items-center justify-between h-full w-full px-8">
         <div className="flex flex-col gap-1.5 center mt-32">
            <h1 className="text-4xl font-bold text-white">
               About you
            </h1>
            <p className="text-sm font-medium text-gray-3">
               Let's find some matching stars
            </p>
         </div>

         <form
            className="flex flex-col h-[314px] w-full gap-4"
            onSubmit={(event) => handleSubmit(event)}
         >
            <div className="flex flex-col w-full gap-1.5">
               <div className="flex justify-between">
                  <p className="text-base font-semibold text-white">Your interests (5 at most)</p>
               </div>
               <div className="flex flex-wrap gap-2 px-4 py-2 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md">
                  {interests.length === 0 ? (
                     <p className="text-gray-3">Ex: Basketball, Cars, Football</p>
                  ) : interests.map((interest, index) => (
                     <InterestButton
                        key={`sel-${index}`}
                        interest={interest}
                        onClick={() => handleSelectedInterestClick(interest)}
                     />
                  ))}
               </div>
            </div>

            <div className="flex-grow flex flex-wrap gap-2 px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md overflow-y-scroll">
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

            <p className="text-center text-red-5">{error}</p>

            <button
               type="submit"
               className="w-full py-2 text-base font-semibold text-white bg-blue-7 rounded-md"
            >
               {loading ? <SpinnerText message="Building your rocket..." /> : <p>Save interests</p>}
            </button>
         </form>

         <div className="mb-12">
            <BackButton />
         </div>
      </div>
   )
}

export default Wrapper({ children: <Interests />, needsAuth: true })
