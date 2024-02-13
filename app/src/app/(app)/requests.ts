import { Post, ServerError } from "@/types"

export const fetchPosts = async (
   reqLastPostId: string | undefined,
   sessionToken: string | undefined
): Promise<{ posts: Post[], lastPostId: string | undefined }> => {
   const requestBody = JSON.stringify({
      lastPostId: reqLastPostId
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
      success: boolean
      message: ServerError
      posts: {
         id: string
         creation: number
         text?: string
         type?: "audio" | "image"
         content?: string
         is_liked?: boolean
         likes_number: number
         comments_number: number
         user_data: {
            username: string
            name: string
            pfp: string
         }
      }[]
      lastPostId: string
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/home/posts`, requestParams)
   const { success, message, posts, lastPostId }: ResponseType = await response.json()

   if (success) return {
      posts: posts.map((post) => ({
         id: post.id,
         createdAt: post.creation,
         type: post.type ?? "text",
         text: post.text,
         content: post.content,
         isLiked: post.is_liked ?? false,
         counters: {
            likeCount: post.likes_number,
            commentCount: post.comments_number
         },
         userData: {
            displayName: post.user_data.name,
            username: post.user_data.username,
            profilePicture: post.user_data.pfp
         }
      })),
      lastPostId: lastPostId
   }

   if (message === "server/no-content" || message === "server/no-friends")
      return {
         posts: [],
         lastPostId: undefined
      }

   throw new Error(message)
}
