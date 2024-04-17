import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { IdResponse } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const user = new UserService()
const cont = new ContentService()

export const POST = [auth.checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const post_id: string = req.params.id

   valid.postIdValidation(post_id).then(async () => {
      cont.getPostOwner(post_id).then((post_owner: string) => {
         user.areFriends(tokenUid, post_owner).then(() => {
            cont.updateLike(post_id, tokenUid).then((idResponse: IdResponse) => {
               res.status(200).json({
                  ...idResponse
               })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
