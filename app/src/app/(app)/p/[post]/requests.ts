import { CommentRoot, Post, ServerError } from "@/types"

export const fetchComments = async (
   reqLastCommentId: string | undefined,
   postId: string,
   sessionToken: string
): Promise<{ comments: CommentRoot[], lastCommentId?: string }> => {
   const requestBody = JSON.stringify({
      last_root_comment_id: reqLastCommentId
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
         comment: {
            id: string
            created_at: number
            content: string
            user_data: {
               name: string
               username: string
               pfp: string
            }
         }
         leafs: number
      }[]
      last_doc_id: string
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/c/roots/${postId}`, requestParams)
   const { message: error, ...result }: ResponseType = await response.json()

   if (!error) return {
      comments: result.content.map((object) => {
         const comment = object.comment

         return {
            id: comment.id,
            createdAt: comment.created_at,
            content: comment.content,
            leavesCount: object.leafs,
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

export const fetchPost = async (
   post: string,
   sessionToken: string
): Promise<Post> => {
   const requestParams: RequestInit = {
      method: "GET",
      headers: { "Authorization": "Bearer " + sessionToken }
   }

   type ResponseType = {
      message?: ServerError
      id: string
      created_at: number
      text_content?: string
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
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/p/${post}`, requestParams)
   const { message: error, ...result }: ResponseType = await response.json()

   if (!error) return {
      id: result.id,
      createdAt: result.created_at,
      type: result.type ?? "text",
      text: result.text_content,
      content: result.content,
      isLiked: result.is_liked,
      counters: {
         likeCount: result.likes,
         commentCount: result.comments
      },
      userData: {
         displayName: result.user_data.name,
         username: result.user_data.username,
         profilePicture: result.user_data.pfp
      }
   }

   throw new Error(error)
}
