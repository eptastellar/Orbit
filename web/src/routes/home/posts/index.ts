import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { ContentFetch } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const user = new UserService()
const cont = new ContentService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const lastPostId: string = req.body.lastPostId

   try {
      if (lastPostId) await valid.postIdValidation(lastPostId)

      user.getFriendList(uid).then((friendList: string[]) => {
         cont.fetchPosts(friendList, lastPostId, uid).then((fetch: ContentFetch) => {
            res.status(200).json({ success: true, posts: fetch.content, lastPostId: fetch.lastDocId })
         }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
