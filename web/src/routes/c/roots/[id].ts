import { Request, Response } from "express"
import { AuthService, ContentService, ValidationService } from "services"
import { ContentFetch } from "types"

const auth = new AuthService()
const cont = new ContentService()
const valid = new ValidationService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const postId: string = req.params.id
   const lastRootCommentId: string = req.body.lastRootCommentId

   try {
      if (lastRootCommentId) await valid.commentRootIdValidation(lastRootCommentId, postId)

      valid.postIdValidation(postId).then(() => {
         cont.fetchRootComments(postId, lastRootCommentId).then((contentFetch: ContentFetch) => {
            res.status(200).json({
               ...contentFetch
            })
         }).catch((error) => { res.status(404).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]
