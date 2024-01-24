import { DocumentData } from "firebase-admin/firestore"

export type PostFetch = {
   posts: DocumentData[],
   lastDocId: string
}
