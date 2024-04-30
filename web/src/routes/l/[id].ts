import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { IdResponse } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const tokenUid: string = res.locals.uid
      const post_id: string = req.params.id

      await valid.documentIdValidation(post_id, "posts")
      core.getOwner(post_id, "posts").then(async (ownerUid: string) => {
         await auth.areFriendsGuard(tokenUid, ownerUid)
         core.updateLike(post_id, tokenUid).then((idResponse: IdResponse) => {
            res.status(200).json({
               ...idResponse
            })
         })
      })
   } catch (error) { resError(res, error) }
}]
