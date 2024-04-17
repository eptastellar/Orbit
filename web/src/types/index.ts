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
