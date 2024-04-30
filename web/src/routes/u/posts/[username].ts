import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { ContentFetch, PostsRequest } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const tokenUid: string = res.locals.uid
      const username: string = req.params.username
      const last_post_id: string = req.body.last_post_id //retrieve the last fetched document

      const ereq: PostsRequest = {
         last_post_id
      }

      if (ereq.last_post_id)
         await valid.documentIdValidation(ereq.last_post_id, "posts")

      core.getUidFromUserData(username).then(async (uid: string) => { //get the uid from the username, also validate the username
         await auth.areFriendsGuard(tokenUid, uid)
         core.fetchPosts([uid], uid, ereq.last_post_id).then((contentFetch: ContentFetch) => {
            res.status(200).json({
               ...contentFetch
            })
         })
      })
   } catch (error) { resError(res, error) }
}]
