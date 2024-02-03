import { DocumentData } from "firebase-admin/firestore"

export type UserInfo = {
   username: string,
   name: string,
   pfp: string
}

export type PostFetch = {
   posts: DocumentData[],
   lastDocId: string
}

export type CommentFetch = {
   comments: DocumentData[],
   lastDocId: string
}
