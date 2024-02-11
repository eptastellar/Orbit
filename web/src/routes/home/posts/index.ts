import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { fetchPosts } from "@contexts/ContentContext"
import { getFriendList } from "@contexts/UserContext"
import { postIdValidation } from "@contexts/ValidationContext"
import { ContentFetch } from "@local-types/index"
import { Request, Response } from "express"

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const lastPostId: string = req.body.lastPostId

   try {
      if (lastPostId) await postIdValidation(lastPostId)

      getFriendList(uid).then((friendList: string[]) => {
         fetchPosts(friendList, lastPostId, uid).then((fetch: ContentFetch) => {
            res.status(200).json({ success: true, posts: fetch.content, lastPostId: fetch.lastDocId })
         }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
