import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { fetchLeafsComments } from "@contexts/ContentContext"
import { Request, Response } from "express"

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const rootId: string = req.params.id
   const lastLeafCommentId: string = req.body.lastLeafCommentId

   fetchLeafsComments(rootId, lastLeafCommentId).then((fetch) => {
      console.log(fetch);
   }).catch((error) => {
      //TODO
   })
}]
