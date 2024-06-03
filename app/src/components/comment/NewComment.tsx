"use client"

import Image from "next/image"
import { useState } from "react"
import { toast } from "react-toastify"

import { Cross, IconButton, PaperPlaneUp, Spinner } from "@/assets/icons"
import { useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/errors"
import { Comment, ServerError } from "@/types"

type Props = {
   postId: string
   refetch: () => void
   replyingTo?: Comment
   clearReply: () => void
}

const NewComment = ({ postId, refetch, replyingTo, clearReply }: Props) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Interaction states
   const [posting, setPosting] = useState<boolean>(false)
   const [text, setText] = useState<string>("")

   // Custom functions triggered by interactions
   const handlePost = async () => {
      if (!posting) {
         // Preliminary checks
         if (!text) return toast.info("Please input some text.")

         // Send the comment to the api endpoint
         setPosting(true)

         const requestBody = JSON.stringify({
            content: text,
            root_id: replyingTo ? replyingTo.id : undefined
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
            id: string
         }

         fetch(`${process.env.NEXT_PUBLIC_API_URL}/c/${postId}`, params)
            .then((response) => response.json())
            .then(({ message: error }: ResponseType) => {
               if (!error) {
                  clearReply()
                  setText("")
                  refetch()
               }
               else toast.error(resolveServerError(error))

               setPosting(false)
            })
      }
   }

   return (
      <div className="flex flex-col items-start justify-center w-full p-4 border-t border-gray-7">
         <div className="flex flex-row between gap-3 w-full mb-4 cursor-pointer">
            <div className="flex center gap-3 cursor-pointer">
               <div className="relative min-h-10 max-h-10 min-w-10 max-w-10 rounded-full overflow-hidden">
                  <Image
                     src={userProfile?.userData.profilePicture!}
                     alt="Profile picture"
                     fill className="object-cover"
                  />
               </div>

               <div className="flex flex-col items-start justify-center">
                  <p className="text-base font-semibold text-white">{userProfile?.userData.displayName}</p>
                  <p className="text-xs font-semibold text-gray-3">{userProfile?.userData.username}</p>
               </div>
            </div>

            <IconButton
               icon={posting
                  ? <Spinner height={24} color="fill-white" />
                  : <PaperPlaneUp height={24} color="fill-white" />
               }
               onClick={handlePost}
            />
         </div>

         {replyingTo &&
            <div className="flex flex-row gap-2 w-full mb-4">
               <IconButton
                  icon={<Cross height={16} color="fill-white" />}
                  onClick={clearReply}
               />

               <p className="text-xs font-normal text-white">
                  Replying to: "{replyingTo.content}"
               </p>
            </div>
         }

         <textarea
            rows={4}
            placeholder="Describe your thoughts..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="w-full px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ring-gray-5 bg-gray-7/50 rounded-md resize-none"
         />
      </div>
   )
}

export default NewComment
