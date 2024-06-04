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
      message?: ServerError
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
   const { message: error, ...result }: ResponseType = await response.json()

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
         text_content?: string
         type?: "audio" | "image"
         content?: string
         is_liked: boolean
         likes: number
         comments: number
         user_data: {
            name: string
            username: string
            pfp: string
         }
      }[]
      last_doc_id: string
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/posts/${reqUsername}`, requestParams)
   const { message: error, ...result }: ResponseType = await response.json()

   if (!error) return {
      posts: result.content.map((post) => ({
         id: post.id,
         createdAt: post.created_at,
         type: post.type ?? "text",
         text: post.text_content,
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

   if (error === "server/no-content")
      return {
         posts: [],
         lastPostId: undefined
      }

   throw new Error(error)
}
