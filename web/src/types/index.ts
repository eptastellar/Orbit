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
   root_id: string,
   last_leaf_comment_id: string,
   post_id: string,
}

export type RootCommentsRequest = {
   post_id: string,
   last_root_comment_id: string
}

export type CommentUploadRequest = {
   post_id: string,
   root_id: string,
   content: string
}

export type CommentUploadResponse = {
   comment_id: string
}

export type DeleteCommentRequest = {
   post_id: string,
   comment_id: string,
   root_id: boolean | string
}

export type SuccessResponse = {
   success: boolean
}

export type UserSchema = {
   username: string,
   name: string,
   pfp: string,
   bday?: number
}

export type ContentFetch = {
   content: DocumentData[],
   last_doc_id: string
}

export type PostSchema = {
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
