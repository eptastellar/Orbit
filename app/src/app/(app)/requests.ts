import { Post, ServerError } from "@/types"

export const fetchPosts = async (
   reqLastPostId: string | undefined,
   sessionToken: string
): Promise<{ posts: Post[], lastPostId?: string }> => {
   const requestBody = JSON.stringify({
      last_post_id: reqLastPostId
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
         text?: string
         type?: "audio" | "image"
         content?: string
         likes: number
         comments: number
         is_liked: boolean
         user_data: {
            name: string
            username: string
            pfp: string
         }
      }[]
      last_doc_id: string
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/home/posts`, requestParams)
   const { message: error, ...result }: ResponseType = await response.json()

   if (!error) return {
      posts: result.content.map((post) => ({
         id: post.id,
         createdAt: post.created_at,
         type: post.type ?? "text",
         text: post.text,
         content: post.content,
         isLiked: post.is_liked,
         counters: {
            likeCount: post.likes,
            commentCount: post.comments
         },
         userData: {
            displayName: post.user_data.name,
            username: post.user_data.username,
            profilePicture: post.user_data.pfp
         }
      })),
      lastPostId: result.last_doc_id
   }

   if (error === "server/no-content" || error === "server/no-friends")
      return {
         posts: [],
         lastPostId: undefined
      }

   throw new Error(error)
}
