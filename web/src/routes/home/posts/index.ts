import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { fetchPosts } from "@contexts/ContentContext"
import { getFriendList } from "@contexts/UserContext"
import { isValidDocId } from "@contexts/ValidationContext"
import { Request, Response } from "express"

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const lastDocId: string = req.body.lastDocId

   Promise.all([
      isValidDocId(lastDocId)
   ])
      .then(async () => {
         const friendList: string[] = await getFriendList(uid)
         fetchPosts(friendList, lastDocId).then((fetch) => {
            res.status(200).json({ success: true, posts: fetch.posts, lastDocId: fetch.lastDocId })
         }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
