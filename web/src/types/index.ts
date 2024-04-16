import { DocumentData } from "firebase-admin/firestore"

export {
   ContentFetch, PostSchema, UserInfo
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

type PostSchema = {
   id: string,
   content?: string,
   text?: string,
   createdAt: number,
   type: string
   likes_number: number,
   comments_number: number,
   is_liked: boolean,
   user_data: UserInfo
}
