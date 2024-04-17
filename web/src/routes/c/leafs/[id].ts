import { Request, Response } from "express"
import { AuthService, ContentService, ValidationService } from "services"
import { ContentFetch } from "types"

const auth = new AuthService()
const cont = new ContentService()
const valid = new ValidationService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const rootId: string = req.params.id
   const lastLeafCommentId: string = req.body.lastLeafCommentId
   const postId: string = req.body.postId

   try {
      if (lastLeafCommentId) await valid.commentLeafIdValidation(lastLeafCommentId, rootId, postId)

      valid.postIdValidation(postId).then(async () => {
         valid.commentRootIdValidation(rootId, postId).then(() => {
            cont.fetchLeafsComments(rootId, lastLeafCommentId).then((fetch: ContentFetch) => {
               res.status(200).json({ success: true, comments: fetch.content, lastLeafCommentId: fetch.lastDocId })
            }).catch((error) => { res.status(404).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]
