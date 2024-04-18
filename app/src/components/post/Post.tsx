"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Comment, IconButton, Like } from "@/assets/icons"
import { useUserContext } from "@/contexts"
import { Post as PostType, ServerError } from "@/types"

import AudioEmbed from "./AudioEmbed"
import ImageEmbed from "./ImageEmbed"

type Props = {
   isPostPage?: boolean
   post: PostType
}

const Post = ({ isPostPage, post }: Props) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Interaction states
   const [isLiked, setIsLiked] = useState<boolean>(post.isLiked)
   const [likesCount, setLikesCount] = useState<number>(post.counters.likeCount)

   const [locked, setLocked] = useState<boolean>(false)

   const likePost = () => {
      if (locked) return

      setLocked(true)

      const params: RequestInit = {
         method: "POST",
         headers: { "Authorization": "Bearer " + userProfile?.sessionToken }
      }

      type ResponseType = {
         error?: ServerError
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/l/${post.id}`, params)
         .then((response) => response.json())
         .then(({ error }: ResponseType) => {
            if (!error) {
               setIsLiked((prev) => !prev)
               setLikesCount((prev) => isLiked ? prev - 1 : prev + 1)

               setLocked(false)
            } else console.error(error)
         })
   }

   return (
      <div
         className={`flex flex-col items-start justify-center w-full p-4 bg-gray-7/50 rounded-md ${isPostPage ? "" : "cursor-pointer"}`}
         onClick={() => { if (!isPostPage) router.push(`/p/${post.id}`) }}
      >
         <div
            className="flex center gap-3 cursor-pointer"
            onClick={() => router.push(`/u/${post.userData.username}`)}
         >
            <div className="relative min-h-10 max-h-10 min-w-10 max-w-10 rounded-full overflow-hidden">
               <Image
                  src={post.userData.profilePicture}
                  alt="Profile picture"
                  fill className="object-cover"
               />
            </div>

            <div className="flex flex-col items-start justify-center">
               <p className="text-base font-semibold text-white">{post.userData.displayName}</p>
               <p className="text-xs font-semibold text-gray-3">{post.userData.username}</p>
            </div>
         </div>

         {post.text && <p className="mt-4 text-sm font-normal text-white">{post.text}</p>}

         {post.type === "audio" && <AudioEmbed src={post.content!} />}
         {post.type === "image" && <ImageEmbed src={post.content!} />}

         <p className="mt-2 text-xs font-normal text-gray-3">
            {new Date(post.createdAt * 1000).toLocaleString("en-US").replace(", ", " · ")}
         </p>

         <div className="flex flex-row start gap-4 mt-2">
            <div className="flex flex-row center gap-1.5">
               <IconButton
                  icon={<Like height={16} color={isLiked ? "fill-red-5" : "fill-gray-3"} fill={isLiked} />}
                  onClick={likePost}
               />
               <p className="text-base font-normal text-white">{likesCount}</p>
            </div>
            <div className="flex flex-row center gap-1.5">
               <Comment height={16} color="fill-gray-3" />
               <p className="text-base font-normal text-white">{post.counters.commentCount}</p>
            </div>
         </div>
      </div>
   )
}

export default Post
