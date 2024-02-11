import { checkIfSessionTokenIsValid } from '@contexts/AuthContext'
import { fetchRootComments } from '@contexts/ContentContext'
import { commentRootIdValidation, postIdValidation } from '@contexts/ValidationContext'
import { ContentFetch } from '@local-types/index'
import { Request, Response } from 'express'

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const postId: string = req.params.id
   const lastRootCommentId: string = req.body.lastRootCommentId

   try {
      if (lastRootCommentId) await commentRootIdValidation(lastRootCommentId, postId)

      postIdValidation(postId).then(() => {
         fetchRootComments(postId, lastRootCommentId).then((fetch: ContentFetch) => {
            res.status(200).json({ success: true, comments: fetch.content, lastRootCommentId: fetch.lastDocId })
         }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
