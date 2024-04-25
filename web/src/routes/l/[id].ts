import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { IdResponse } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const post_id: string = req.params.id

   valid.documentIdValidation(post_id, "posts").then(async () => {
      core.getPostOwner(post_id).then((post_owner: string) => {
         auth.areFriendsGuard(tokenUid, post_owner).then(() => {
            core.updateLike(post_id, tokenUid).then((idResponse: IdResponse) => {
               res.status(200).json({
                  ...idResponse
               })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
