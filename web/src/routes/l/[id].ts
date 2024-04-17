import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"

const auth = new AuthService()
const valid = new ValidationService()
const user = new UserService()
const cont = new ContentService()

export const POST = [auth.checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const postId: string = req.params.id

   valid.postIdValidation(postId).then(async () => {
      cont.getPostOwner(postId).then((post_owner: string) => {
         user.areFriends(tokenUid, post_owner).then(() => {
            cont.updateLike(postId, tokenUid).then(() => {
               res.status(200).json({ success: true })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
