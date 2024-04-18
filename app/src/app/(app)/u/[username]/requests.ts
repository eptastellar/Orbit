import { Post, ServerError, UserProfile } from "@/types"

export const fetchProfile = async (
   reqUsername: string,
   sessionToken: string
): Promise<UserProfile> => {
   const requestParams: RequestInit = {
      method: "GET",
      headers: { "Authorization": "Bearer " + sessionToken }
   }

   type ResponseType = {
      error?: ServerError
      personal: boolean
      counters: {
         posts: number
         friends: number
         meteors: number
      }
      user_data: {
         name: string
         username: string
         pfp: string
         interests: string[]
      }
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/${reqUsername}`, requestParams)
   const { error, ...result }: ResponseType = await response.json()

   if (!error) return {
      isPersonal: result.personal,
      interests: result.user_data.interests,
      counters: {
         postCount: result.counters.posts,
         friendCount: result.counters.friends,
         meteorCount: result.counters.meteors
      },
      userData: {
         displayName: result.user_data.name,
         username: result.user_data.username,
         profilePicture: result.user_data.pfp
      }
   }

   throw new Error(error)
}

export const fetchPosts = async (
   reqUsername: string,
   reqLastPostId: string | undefined,
   sessionToken: string
): Promise<{ posts: Post[], lastPostId: string | undefined }> => {
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
      error?: ServerError
      content: {
         id: string
         createdAt: number
         text?: string
         type?: "audio" | "image"
         content?: string
         is_liked: boolean
         likes_number: number
         comments_number: number
         user_data: {
            name: string
            username: string
            pfp: string
         }
      }[]
      last_doc_id: string
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/posts/${reqUsername}`, requestParams)
   const { error, ...result }: ResponseType = await response.json()

   if (!error) return {
      posts: result.content.map((post) => ({
         id: post.id,
         createdAt: post.createdAt,
         type: post.type ?? "text",
         text: post.text,
         content: post.content,
         isLiked: post.is_liked,
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
      lastPostId: result.last_doc_id
   }

   if (error === "server/no-content")
      return {
         posts: [],
         lastPostId: undefined
      }

   throw new Error(error)
}
