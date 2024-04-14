import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { ContentFetch } from "types"

const auth = new AuthService()
const user = new UserService()
const valid = new ValidationService()
const cont = new ContentService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const lastPostId: string = req.body.lastPostId //retrieve the last fetched document
   const username: string = req.params.username

   try {
      if (lastPostId) await valid.postIdValidation(lastPostId)

      user.getUIDfromUserData(username).then(async (uid: string) => { //get the uid from the username, also validate the username
         user.areFriends(tokenUid, uid).then(() => {
            cont.fetchPosts([uid], lastPostId, uid).then((fetch: ContentFetch) => {
               res.status(200).json({ success: true, posts: fetch.content, lastPostId: fetch.lastDocId })
            }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
