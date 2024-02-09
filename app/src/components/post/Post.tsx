"use router"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { Comment, Like } from "@/assets/icons"
import { Post } from "@/types"

import AudioEmbed from "./AudioEmbed"
import ImageEmbed from "./ImageEmbed"

type Props = {
   post: Post
}

const Post = ({ post }: Props) => {
   const router = useRouter()

   return (
      <div className="flex flex-col items-start justify-center w-full p-4 bg-gray-7/50 rounded-md">
         <div
            className="flex center gap-3"
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
            {new Date(post.createdAt).toLocaleString("en-US").replace(", ", " · ")}
         </p>

         <div className="flex flex-row items-center justify-start gap-4 mt-2">
            <div className="flex flex-row center gap-1.5">
               <Like height={16} color={post.isLiked ? "fill-red-5" : "fill-gray-3"} fill={post.isLiked} />
               <p className="text-base font-normal text-white">{post.counters.likeCount}</p>
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
