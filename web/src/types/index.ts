import { interests } from "assets"
import { DocumentData } from "firebase-admin/firestore"

export type AuthResponse = {
   username: string,
   name: string,
   pfp: string,
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
   content: DocumentData[],
   last_doc_id: string
}

export type PostResponse = {
   id: string,
   user_data: UserSchema,
   createdAt: number,
   likes_number: number,
   comments_number: number,
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
   interests: string[],
   counters: {
      posts: number,
      friends: number,
      meteors: number
   }
}

export type SettingsResponse = {
   user_data: UserSchema
}
