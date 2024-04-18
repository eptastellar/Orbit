"use client"

import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { supernovaRejected } from "@/assets"
import { Cross, IconButton } from "@/assets/icons"
import { HeaderWithButton, Post } from "@/components"
import { useUserContext } from "@/contexts"

import { fetchPost } from "./requests"

type Props = {
   params: {
      post: string
   }
}

const User = ({ params }: Props) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Dynamic route parameters
   const post = decodeURIComponent(params.post)

   // Async query loading/error states
   const { data: fetchedPost, error: postError, isLoading } = useQuery({
      queryKey: ["post", post],
      queryFn: () => fetchPost(post, userProfile?.sessionToken!),

      retry: false
   })

   useEffect(() => {
      if (postError) console.error(postError)
   }, [postError])

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton icon={
            <IconButton
               icon={<Cross height={24} />}
               onClick={() => router.back()}
            />
         } />

         <div className="flex flex-grow flex-col items-center w-full p-8 overflow-scroll">
            {fetchedPost
               ? <Post post={fetchedPost} isPostPage />
               : (isLoading
                  ? <div className="h-64 w-full loader-pulse rounded-md" />
                  : <div className="flex flex-col flex-grow center w-full mt-6">
                     <Image
                        src={supernovaRejected}
                        alt="User has no posts to display"
                        className="w-2/3"
                     />
                     <p className="mt-4 text-center text-base font-semibold text-white">
                        This post doesn't exist.
                     </p>
                  </div>
               )
            }
         </div>
      </div>
   )
}

export default User
