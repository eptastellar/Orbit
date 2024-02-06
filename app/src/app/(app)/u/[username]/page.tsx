"use client"

import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { profile } from "@/assets"
import { Gear, IconButton, ThreeDotsVertical } from "@/assets/icons"
import { HeaderWithButton, Navbar } from "@/components"
import { useUserContext } from "@/contexts"

import { fetchPosts, fetchProfile } from "./requests"

type Props = {
   params: {
      username: string
   }
}

const User = ({ params }: Props) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Dynamic route parameters
   const username = decodeURIComponent(params.username)

   // Fetching and async states
   const [lastDocId, setLastDocId] = useState<string>()

   const { data: fetchedUser, error: profileError } = useQuery({
      queryKey: ["user", username],
      queryFn: () => fetchProfile(username, userProfile?.sessionToken)
   })

   const { data: fetchedPosts, error: postsError } = useQuery({
      queryKey: ["user", "posts", username],
      queryFn: () => fetchPosts(username, lastDocId, userProfile?.sessionToken)
   })

   useEffect(() => {
      if (fetchedPosts?.lastDocId)
         setLastDocId(fetchedPosts?.lastDocId)
   }, [fetchedPosts])

   useEffect(() => {
      if (profileError) console.error(profileError)
      if (postsError) console.error(postsError)
   }, [profileError, postsError])

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            icon={fetchedUser?.personal ?? userProfile!.username === username
               ? <IconButton
                  icon={<Gear height={24} />}
                  onClick={() => router.push("/settings")}
               />
               : <IconButton
                  icon={<ThreeDotsVertical height={24} />}
                  onClick={() => router.push("/chats")}
               />
            }
         />

         <div className="flex flex-grow flex-col items-center w-full p-8 overflow-scroll">
            {
               // If the visited page is owned by the user
               fetchedUser?.personal ?? userProfile!.username === username
                  ? <Image
                     src={fetchedUser?.profilePicture ?? userProfile!.profilePicture}
                     alt="Profile picture"
                     height={128}
                     width={128}
                     className="h-32 w-32 object-cover rounded-full"
                  />
                  // Otherwise, if it hasn't been fetched, show a loading icon
                  : fetchedUser
                     ? <Image
                        src={fetchedUser?.profilePicture ?? userProfile!.profilePicture}
                        alt="Profile picture"
                        height={128}
                        width={128}
                        className="h-32 w-32 object-cover rounded-full"
                     />
                     : <div className="h-32 w-32 loader rounded-full" />
            }


            <div className="flex flex-col center mt-8">
               {fetchedUser?.name
                  ? <p className="text-2xl font-semibold text-white">{fetchedUser.name}</p>
                  : <div className="h-6 w-48 my-1 loader rounded-md" />
               }

               <p className="text-base font-semibold text-gray-3">{username}</p>
            </div>

            <div className="flex flex-row center w-full py-6 border-b border-gray-7">
               <div className="flex flex-col center w-1/3">
                  {fetchedUser?.counters.postCount !== undefined ?
                     <p className="text-xl font-semibold text-white">
                        {fetchedUser.counters.postCount}
                     </p>
                     : <div className="h-5 w-2/3 my-1 loader rounded-md" />
                  }
                  <p className="text-base font-semibold text-gray-3">POSTS</p>
               </div>
               <div className="flex flex-col center w-1/3 border-x border-gray-7">
                  {fetchedUser?.counters.friendCount !== undefined ?
                     <p className="text-xl font-semibold text-white">
                        {fetchedUser.counters.friendCount}
                     </p>
                     : <div className="h-5 w-2/3 my-1 loader rounded-md" />
                  }
                  <p className="text-base font-semibold text-gray-3">FRIENDS</p>
               </div>
               <div className="flex flex-col center w-1/3">
                  {fetchedUser?.counters.meteorCount !== undefined ?
                     <p className="text-xl font-semibold text-white">
                        {fetchedUser.counters.meteorCount}
                     </p>
                     : <div className="h-5 w-2/3 my-1 loader rounded-md" />
                  }
                  <p className="text-base font-semibold text-gray-3">METEORS</p>
               </div>
            </div>

            {/* TODO: Actually detect if the user has posts and map over them */}
            <div className="flex flex-col flex-grow center w-full py-6">
               <Image
                  src={profile}
                  alt="User has no posts to display"
                  className="w-2/3"
               />
               <p className="mt-4 text-center text-base font-semibold text-white">
                  {fetchedUser?.personal
                     ? "You haven't posted anything yet."
                     : "This user hasn't posted anything yet."
                  }
               </p>
            </div>
         </div>

         <Navbar />
      </div>
   )
}

export default User
