export type LocalUser = {
   profilePicture: string
   username: string
   sessionToken: string
}

export type UserProfile = {
   personal: boolean
   username: string
   name: string
   profilePicture: string
   counters: {
      postCount: number
      friendCount: number
      meteorCount: number
   }
}
