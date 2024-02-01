import { checkIfSessionTokenIsValid } from '@contexts/AuthContext'
import { fetchRootComments } from '@contexts/ContentContext'
import { Request, Response } from 'express'

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const postId: string = req.params.id
   const lastRootCommentId: string = req.body.lastRootCommentId

   fetchRootComments(postId, lastRootCommentId).then((fetch) => {
      console.log(fetch);
      //TODO
   }).catch((error) => {

   })
}]
