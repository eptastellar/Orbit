"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { supernovaRejected } from "@/assets"
import { Cross, IconButton } from "@/assets/icons"
import { Comment, HeaderWithButton, InfiniteLoader, NewComment, Post } from "@/components"
import { useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/errors"
import { CommentRoot, Comment as CommentType } from "@/types"

import { fetchComments, fetchPost } from "./requests"

type Props = {
   params: {
      post: string
   }
}

const PostPage = ({ params }: Props) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Dynamic route parameters
   const post = decodeURIComponent(params.post)

   // Interaction states
   const [replyingTo, setReplyingTo] = useState<CommentType>()

   // Async query loading/error states
   const { data: fetchedPost, error: postError, isLoading } = useQuery({
      queryKey: ["post", post],
      queryFn: () => fetchPost(post, userProfile?.sessionToken!),

      retry: false
   })

   const {
      data: fetchedCommentsPages,
      error: commentsError,
      fetchNextPage: fetchNextComments,
      hasNextPage: hasNextComments,
      refetch: refetchComments
   } = useInfiniteQuery({
      queryKey: ["post", post, "comments"],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
         fetchComments(pageParam, post, userProfile?.sessionToken!),

      retry: false,

      initialPageParam: undefined,
      getNextPageParam: (prev) => prev.lastCommentId
   })

   const fetchedComments: CommentRoot[] | undefined = fetchedCommentsPages?.pages
      .flatMap((page) => page.comments.flatMap((post) => post))

   useEffect(() => {
      if (commentsError) toast.error(resolveServerError(commentsError.message))
      if (postError) toast.error(resolveServerError(postError.message))
   }, [commentsError, postError])

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton icon={
            <IconButton
               icon={<Cross height={24} />}
               onClick={() => router.back()}
            />
         } />

         <div className="flex flex-grow flex-col items-center w-full p-8 overflow-scroll">
            {fetchedPost && <>
               <Post post={fetchedPost} isPostPage />

               {fetchedComments
                  ? fetchedComments.length > 0
                     // There are some comments to be shown
                     ? <div className="flex flex-col start gap-4 w-full mt-8">
                        {fetchedComments.map((comment) => <Comment
                           key={comment.id}
                           postId={post}
                           comment={comment}
                           setReplyingTo={() => setReplyingTo(comment)}
                        />)}
                        {hasNextComments && <InfiniteLoader onScreen={fetchNextComments} />}
                     </div>
                     // There are no comments to be shown
                     : <div className="flex flex-col center w-full mt-8">
                        <p className="text-center text-base font-semibold text-white">
                           This post has no comments yet.
                        </p>
                     </div>
                  // The comments are still being fetched
                  : <div className="flex flex-col start gap-4 w-full mt-8">
                     {Array.from(Array(10).keys()).map((index) =>
                        <div
                           key={`comment-${index}`}
                           className="h-16 w-full loader-pulse rounded-md"
                           style={{ animationDelay: `${index * 0.15}s` }}
                        />
                     )}
                  </div>
               }
            </>}

            {!fetchedPost && (isLoading
               ? <div className="h-64 w-full loader-pulse rounded-md" />
               : <div className="flex flex-col flex-grow center w-full mt-6">
                  <Image
                     src={supernovaRejected}
                     alt="Post doesn't exist"
                     className="w-2/3"
                  />
                  <p className="mt-4 text-center text-base font-semibold text-white">
                     This post doesn't exist.
                  </p>
               </div>
            )}
         </div>

         {fetchedPost && <NewComment
            postId={post}
            refetch={refetchComments}
            replyingTo={replyingTo}
            clearReply={() => setReplyingTo(undefined)}
         />}
      </div>
   )
}

export default PostPage
