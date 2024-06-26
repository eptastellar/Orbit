export type Comment = {
   id: string
   createdAt: number
   content: string
   userData: UserData
}

export type CommentRoot = Comment & { leavesCount: number }

export type LocalUser = {
   sessionToken: string
   userData: UserData
}

export type MediaType = "audio" | "image"

export type Notification = {
   // TODO: Update the notification type
   id: string
}

export type Post = {
   id: string
   createdAt: number
   type: MediaType | "text"
   text?: string
   content?: string
   isLiked: boolean
   counters: {
      likeCount: number
      commentCount: number
   }
   userData: UserData
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
   "server/not-friends" |
   "server/no-content" |
   "server/no-friends" |
   "server/unauthorized"

export type UserData = {
   displayName: string
   username: string
   profilePicture: string
}

export type UserProfile = {
   isPersonal: boolean
   interests: string[]
   counters: {
      postCount: number
      friendCount: number
      meteorCount: number
   }
   userData: UserData
}
