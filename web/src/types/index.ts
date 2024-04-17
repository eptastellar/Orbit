import { DocumentData } from "firebase-admin/firestore"

export type AuthResponse = {
   username: string,
   name: string,
   pfp: string,
   jwt: string
}

export type UserSchema = {
   username: string,
   name: string,
   pfp: string,
   bday?: number
}

export type ContentFetch = {
   content: DocumentData[],
   lastDocId: string
}

export type PostSchema = {
   id: string,
   user_data: UserSchema
   createdAt: number,
   likes_number: number,
   comments_number: number,
   is_liked: boolean,
   content?: string,
   text?: string,
   type?: string
}
