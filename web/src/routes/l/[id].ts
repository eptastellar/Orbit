import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { LikeRequest, SuccessResponse } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const user = new UserService()
const cont = new ContentService()

export const POST = [auth.checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const post_id: string = req.params.id

   const ereq: LikeRequest = {
      post_id
   }

   valid.postIdValidation(ereq.post_id).then(async () => {
      cont.getPostOwner(ereq.post_id).then((post_owner: string) => {
         user.areFriends(tokenUid, post_owner).then(() => {
            cont.updateLike(ereq.post_id, tokenUid).then((success: SuccessResponse) => {
               res.status(200).json({
                  ...success
               })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
