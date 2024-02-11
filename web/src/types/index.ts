import { DocumentData } from "firebase-admin/firestore"

export type UserInfo = {
   username: string,
   name: string,
   pfp: string
}

export type ContentFetch = {
   content: DocumentData[],
   lastDocId: string
}
