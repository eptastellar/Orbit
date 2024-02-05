import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { fetchLeafsComments } from "@contexts/ContentContext"
import { commentLeafIdValidation, commentRootIdValidation, postIdValidation } from "@contexts/ValidationContext"
import { CommentFetch } from "@local-types/index"
import { Request, Response } from "express"

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const rootId: string = req.params.id
   const lastLeafCommentId: string = req.body.lastLeafCommentId
   const postId: string = req.body.postId

   try {
      if (lastLeafCommentId) await commentLeafIdValidation(lastLeafCommentId, rootId, postId)

      postIdValidation(postId).then(async () => {
         commentRootIdValidation(rootId, postId).then(() => {
            fetchLeafsComments(rootId, lastLeafCommentId).then((fetch: CommentFetch) => {
               res.status(200).json({ success: true, comments: fetch.comments, lastDocId: fetch.lastDocId })
            }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
