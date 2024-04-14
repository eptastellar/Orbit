import { DocumentData } from "firebase-admin/firestore"

export {
   ContentFetch,
   UserInfo
}

type UserInfo = {
   username: string,
   name: string,
   pfp: string
}

type ContentFetch = {
   content: DocumentData[],
   lastDocId: string
}
