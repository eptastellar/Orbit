import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { ContentFetch, PostsRequest } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      const last_post_id: string = req.body.last_post_id

      const ereq: PostsRequest = {
         last_post_id
      }

      if (ereq.last_post_id)
         await valid.documentIdValidation(ereq.last_post_id, "posts")

      core.getFriendList(uid).then((friendList: string[]) => {
         core.fetchPosts(friendList, uid, ereq.last_post_id).then((contentFetch: ContentFetch) => {
            res.status(200).json({
               ...contentFetch
            })
         })
      })
   } catch (error) { resError(res, error) }
}]
