import { DocumentData } from "firebase-admin/firestore"

export type PostFetch = {
   posts: DocumentData[],
   lastDocId: string
}

export type CommentFetch = {
   comments: DocumentData[],
   lastDocId: string
}
