"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { galaxy } from "@/assets"
import { BackButton, LargeButton } from "@/components"
import { useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/errors"
import { ServerError, UserData } from "@/types"

const Supernova = () => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(true)
   const [sending, setSending] = useState<boolean>(false)
   const [friend, setFriend] = useState<UserData>()
   const [status, setStatus] = useState<{ oneway: string, status: string }>()

   // Custom functions triggered by interactions
   const handleChoice = (choice: "accepted" | "rejected") => {
      if (!sending && friend && status) {
         // Send the choice to the api endpoint
         setSending(true)

         const requestBody = JSON.stringify({
            username: friend.username,
            accepted: choice === "accepted",
            status: status.status,
            oneway: status.oneway,
         })

         const params: RequestInit = {
            method: "POST",
            headers: {
               "Authorization": "Bearer " + userProfile?.sessionToken!,
               "Content-Type": "application/json"
            },
            body: requestBody
         }

         type ResponseType = {
            message?: ServerError
            response: string
         }

         fetch(`${process.env.NEXT_PUBLIC_API_URL}/supernova`, params)
            .then((response) => response.json())
            .then(({ message: error }: ResponseType) => {
               if (!error) router.push(`/supernova/${choice}?username=${friend.username}`)
               else toast.error(resolveServerError(error))
            })
            .finally(() => setSending(false))
      }
   }

   useEffect(() => {
      const params: RequestInit = {
         method: "GET",
         headers: {
            "Authorization": "Bearer " + userProfile?.sessionToken!,
            "Content-Type": "application/json"
         }
      }

      type ResponseType = {
         message?: ServerError
         status: string
         oneway: string
         user: {
            username: string
            name: string
            pfp: string
            interests: string[]
         }
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/supernova`, params)
         .then((response) => response.json())
         .then(({ message: error, ...result }: ResponseType) => {
            if (!error) {
               setFriend({
                  username: result.user.username,
                  displayName: result.user.name,
                  profilePicture: result.user.pfp,
               })
               setStatus({
                  oneway: result.oneway,
                  status: result.status,
               })
            } else {
               toast.error(resolveServerError(error))
            }
         })
         .finally(() => setLoading(false))
   }, [])

   return (
      <div className="flex flex-col between h-full w-full">
         <div className="relative w-full">
            <Image
               src={galaxy}
               alt="Supernova illustration"
               className="w-full"
            />

            <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-20">
               <div className="relative min-h-32 max-h-32 min-w-32 max-w-32 rounded-full overflow-hidden">
                  {!loading && friend
                     ? <Image
                        src={friend.profilePicture}
                        alt="Profile picture"
                        fill className="object-cover"
                     />
                     : <div className="min-h-32 max-h-32 min-w-32 max-w-32 loader-pulse rounded-full" />
                  }
               </div>
            </div>

            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-transparent to-black to-95% z-10" />
         </div>

         <div className="flex flex-grow flex-col between w-full p-8">
            <div className="flex flex-col gap-4 center">
               <p className="text-sm font-semibold text-white">
                  You may make a new friend in the stars! ✨
               </p>

               <div className="flex flex-col center w-full">
                  {!loading && friend
                     ? <p className="text-2xl font-bold text-white">{friend.displayName}</p>
                     : <div className="h-6 w-2/3 my-1 loader-pulse rounded-md" />
                  }
                  {!loading && friend
                     ? <p className="text-sm font-semibold text-gray-5">{friend.username}</p>
                     : <div className="h-3.5 w-2/3 my-1 loader-pulse rounded-md" />
                  }
               </div>
            </div>

            <div className="flex flex-col gap-2 center w-full">
               <LargeButton text="Extraordinary!" onClick={() => handleChoice("accepted")} />
               <LargeButton text="I'm not interested" background="bg-gray-7" onClick={() => handleChoice("rejected")} />
            </div>

            <BackButton />
         </div>
      </div>
   )
}

export default Supernova
