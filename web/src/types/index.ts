export type AuthResponse = {
   user_data: UserSchema,
   jwt: string
}

export type SignUpRequest = {
   authorization: string,
   username: string,
   interests: string[],
   bday: number,
   pfp?: string
}

export type SignUpValidateRequest = {
   username: string,
   bday: number
}

export type LeafCommentsRequest = {
   last_leaf_comment_id: string,
   post_id: string,
}

export type RootCommentsRequest = {
   last_root_comment_id: string
}

export type CommentUploadRequest = {
   root_id: string,
   content: string
}

export type CommentUploadResponse = {
   comment_id: string
}

export type DeleteCommentRequest = {
   comment_id: string,
   root_id: boolean | string
}

export type PostsRequest = {
   last_post_id: string
}

export type InterestsResponse = {
   interests: string[]
}

export type SuccessResponse = {
   success: boolean
}

export type UserSchema = {
   username: string,
   name: string,
   pfp: string,
   bday?: number,
   interests?: string[]
}

export type ContentFetch = {
   content: PostResponse[] | RootCommentSchema[] | CommentSchema[],
   last_doc_id: string
}

export type RootCommentSchema = {
   comment: CommentSchema
   leafs: number,
}

export type CommentSchema = {
   id: string,
   created_at: number,
   content: string,
   user_data: UserSchema
}

export type PostResponse = {
   id: string,
   user_data: UserSchema,
   created_at: number,
   likes: number,
   comments: number,
   is_liked: boolean,
   content?: string,
   text?: string,
   type?: string
}

export type PostRequest = {
   text?: string,
   type?: string,
   content?: string
}

export type IdResponse = {
   id: string
}

export type UserResponse = {
   personal: boolean,
   user_data: UserSchema,
   counters: {
      posts: number,
      friends: number,
      meteors: number
   }
}

export type SupernovaResponse = {
   username: string
   status: string
   oneway: string | null
}

export type UploadMessageRequest = {
   text: string,
   type: string,
   content: string
}

export type GroupChatMessageRequest = {
   text: string,
   type: string,
   content: string
}

export type NewPersonalChatRequest = {
   receiver_username: string
}

export type NewGroupChatRequest = {
   members: string[],
   pfp?: string,
   name: string
}

export type ChatsResponse = {
   chats: ChatSchema[]
}

export type ChatSchema = {
   name: string,
   pfp: string
   bday?: boolean
   latest_message?: string
   unreaded_messages?: number
}

export type PersonalChatInfoResponse = {
   user_data: UserSchema
}

export type GroupChatInfoResponse = {
   name: string
   pfp: string
   members_name: string[]
}

export type MessageSchema = {
   personal: boolean,
   created_at: number,
   text?: string,
   content?: string,
   type?: string,
   pfp?: string,
   username?: string
}
