export type LocalUser = {
   username: string
   profilePicture: string
   sessionToken: string
}

export type Post = {
   id: string
   createdAt: number
   type: "audio" | "image" | "text"
   text?: string
   content?: string
   isLiked: boolean
   counters: {
      likeCount: number
      commentCount: number
   }
   userData: {
      displayName: string
      username: string
      profilePicture: string
   }
}

export type ServerError =
   // Authentication errors
   "auth/expired-token" |
   "auth/invalid-token" |
   "auth/email-unverified" |
   "auth/user-not-signed-up" |
   "auth/user-already-exists" |
   // Validation errors
   "validation/username-too-long" |
   "validation/username-too-short" |
   "validation/invalid-username" |
   "validation/username-already-in-use" |
   "validation/invalid-birthdate" |
   "validation/too-young" |
   "validation/invalid-number-of-interests" |
   "validation/invalid-interests" |
   "validation/invalid-document-id" |
   "validation/malformed-input" |
   // Server errors
   "server/no-content" |
   "server/no-friends"

export type UserProfile = {
   isPersonal: boolean
   displayName: string
   username: string
   profilePicture: string
   interests: string[]
   counters: {
      postCount: number
      friendCount: number
      meteorCount: number
   }
}
