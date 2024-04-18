import { Post, ServerError } from "@/types"

export const fetchPost = async (
   post: string,
   sessionToken: string
): Promise<Post> => {
   const requestParams: RequestInit = {
      method: "GET",
      headers: { "Authorization": "Bearer " + sessionToken }
   }

   type ResponseType = {
      error?: ServerError
      id: string
      created_at: number
      text?: string
      type?: "audio" | "image"
      content?: string
      likes_number: number
      comments_number: number
      is_liked: boolean
      user_data: {
         name: string
         username: string
         pfp: string
      }
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/p/${post}`, requestParams)
   const { error, ...result }: ResponseType = await response.json()

   if (!error) return {
      id: result.id,
      createdAt: result.created_at,
      type: result.type ?? "text",
      text: result.text,
      content: result.content,
      isLiked: result.is_liked,
      counters: {
         likeCount: result.likes_number,
         commentCount: result.comments_number
      },
      userData: {
         displayName: result.user_data.name,
         username: result.user_data.username,
         profilePicture: result.user_data.pfp
      }
   }

   throw new Error(error)
}
