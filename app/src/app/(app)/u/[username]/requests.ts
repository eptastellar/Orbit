import { Post, ServerError, UserProfile } from "@/types"

export const fetchProfile = async (
   reqUsername: string,
   sessionToken: string | undefined
): Promise<UserProfile> => {
   const requestParams: RequestInit = {
      method: "GET",
      headers: { "Authorization": "Bearer " + sessionToken }
   }

   type ResponseType = {
      success: boolean
      message: ServerError
      personal: boolean
      username: string
      name: string
      pfp: string
      interests: string[]
      counters: {
         post_count: number
         friends_count: number
         meteor_count: number
      }
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/${reqUsername}`, requestParams)
   const { success, message, personal, username, name, pfp, interests, counters }: ResponseType = await response.json()

   if (success) return {
      personal: personal,
      username: username,
      name: name,
      profilePicture: pfp,
      interests: interests,
      counters: {
         postCount: counters.post_count,
         friendCount: counters.friends_count,
         meteorCount: counters.meteor_count
      }
   }

   throw new Error(message)
}

export const fetchPosts = async (
   reqUsername: string,
   reqLastDocId: string | undefined,
   sessionToken: string | undefined
): Promise<{ posts: Post[], lastDocId: string | undefined }> => {
   const requestBody = JSON.stringify({
      lastDocId: reqLastDocId
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
         owner: string
         type: "audio" | "image" | "text"
         content: string
         text?: string
         likes_number: number
         createdAt: number
      }[]
      lastDocId: string
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/posts/${reqUsername}`, requestParams)
   const { success, message, posts, lastDocId }: ResponseType = await response.json()

   if (success) return {
      posts: posts.map((post) => ({
         owner: post.owner,
         type: post.type,
         content: post.content,
         text: post.text,
         likesCount: post.likes_number,
         createdAt: post.createdAt
      })),
      lastDocId: lastDocId
   }

   if (message === "server/no-content")
      return {
         posts: [],
         lastDocId: undefined
      }


   throw new Error(message)
}
