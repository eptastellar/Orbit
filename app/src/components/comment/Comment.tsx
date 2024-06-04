"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { CaretDown, IconButton, RepliedRight, ReplyLeft } from "@/assets/icons"
import { useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/errors"
import { CommentRoot, Comment as CommentType, ServerError } from "@/types"

export const fetchComments = async (
   reqLastCommentId: string | undefined,
   postId: string,
   rootId: string,
   sessionToken: string
): Promise<{ comments: CommentType[], lastCommentId: string | undefined }> => {
   const requestBody = JSON.stringify({
      last_leaf_comment_id: reqLastCommentId,
      post_id: postId
   })

   const requestParams: RequestInit = {
      method: "POST",
      headers: {
         "Authorization": "Bearer " + sessionToken,
         "Content-Type": "application/json"
      },
      body: requestBody
   }

   type ResponseType = {
      message?: ServerError
      content: {
         id: string
         created_at: number
         content: string
         user_data: {
            name: string
            username: string
            pfp: string
         }
      }[]
      last_doc_id: string
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/c/leafs/${rootId}`, requestParams)
   const { message: error, ...result }: ResponseType = await response.json()

   if (!error) return {
      comments: result.content.map((comment) => {
         return {
            id: comment.id,
            createdAt: comment.created_at,
            content: comment.content,
            userData: {
               displayName: comment.user_data.name,
               username: comment.user_data.username,
               profilePicture: comment.user_data.pfp
            }
         }
      }),
      lastCommentId: result.last_doc_id
   }

   if (error === "server/no-content")
      return {
         comments: [],
         lastCommentId: undefined
      }

   throw new Error(error)
}

type Props = {
   postId: string
   comment: CommentRoot
   setReplyingTo: (replyingTo: CommentType) => void
}

const Comment = ({ postId, comment, setReplyingTo }: Props) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Interaction states
   const [subcommentsVisible, setSubcommentsVisible] = useState<boolean>(false)

   // Custom functions triggered by interactions
   const fetchSubcomments = () => {
      if (subcommentsVisible)
         fetchNextComments()

      setSubcommentsVisible(true)
   }

   // Async query loading/error states
   const {
      data: fetchedCommentsPages,
      error: commentsError,
      fetchNextPage: fetchNextComments,
      hasNextPage: hasNextComments,
      refetch: refetchComments
   } = useInfiniteQuery({
      queryKey: ["comment", comment.id, "subcomments"],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
         fetchComments(pageParam, postId, comment.id, userProfile?.sessionToken!),

      retry: false,

      initialPageParam: undefined,
      getNextPageParam: (prev) => prev.lastCommentId
   })

   const fetchedComments: CommentType[] | undefined = fetchedCommentsPages?.pages
      .flatMap((page) => page.comments.flatMap((post) => post))

   useEffect(() => {
      if (commentsError) toast.error(resolveServerError(commentsError.message))
   }, [commentsError])

   return (
      <div className="flex flex-col items-start justify-center w-full">
         <div className="flex flex-col items-start justify-center w-full">
            <div className="flex flex-row between gap-3 w-full mb-2 cursor-pointer">
               <div
                  className="flex flex-row center gap-3 cursor-pointer"
                  onClick={() => router.push(`/u/${comment.userData.username}`)}
               >
                  <div className="relative min-h-10 max-h-10 min-w-10 max-w-10 rounded-full overflow-hidden">
                     <Image
                        src={comment.userData.profilePicture}
                        alt="Profile picture"
                        fill className="object-cover"
                     />
                  </div>

                  <div className="flex flex-col items-start justify-center">
                     <p className="text-base font-semibold text-white">{comment.userData.displayName}</p>
                     <p className="text-xs font-semibold text-gray-3">{comment.userData.username}</p>
                  </div>
               </div>

               <IconButton
                  icon={<ReplyLeft height={16} color="fill-white" />}
                  onClick={() => setReplyingTo(comment)}
               />
            </div>

            <p className="ml-[52px] text-sm font-normal text-white">{comment.content}</p>
         </div>

         {subcommentsVisible &&
            <div className="w-full mt-2 py-2">
               {fetchedComments?.map((subcomment) => (
                  <div key={subcomment.id} className="flex flex-row start gap-3 w-full mt-2 first:mt-0">
                     <div className="flex center w-10">
                        <RepliedRight height={8} color="fill-gray-5" />
                     </div>

                     <div className="flex flex-row center gap-3">
                        <div
                           className="relative min-h-6 max-h-6 min-w-6 max-w-6 rounded-full overflow-hidden cursor-pointer"
                           onClick={() => router.push(`/u/${comment.userData.username}`)}
                        >
                           <Image
                              src={subcomment.userData.profilePicture}
                              alt="Profile picture"
                              fill className="object-cover"
                           />
                        </div>

                        <p className="text-xs font-normal text-gray-3">
                           {subcomment.content.replaceAll("\n", " ")}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         }

         {comment.leavesCount > 0 && hasNextComments &&
            <div
               className="flex flex-row center gap-3 mt-2 cursor-pointer"
               onClick={fetchSubcomments}
            >
               <div className="flex center w-10">
                  <CaretDown height={6} color="fill-gray-5" />
               </div>

               <p className="text-xs font-semibold text-gray-5">
                  Show {!subcommentsVisible ? "the" : "more"} replies
               </p>
            </div>
         }
      </div>
   )
}

export default Comment
