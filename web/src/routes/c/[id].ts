import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { uploadComment } from "@contexts/ContentContext"
import { isValidCommentRootId, isValidDocId } from "@contexts/ValidationContext"
import { Request, Response } from "express"

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id
   const rootId: string = req.body.rootId
   const content: string = req.body.content

   Promise.all([
      isValidDocId(postId) //TODO: fix
   ])
      .then(async () => {
         try {
            if (rootId) await isValidCommentRootId(rootId, postId)

            uploadComment(uid, rootId, postId, content).then((comment) => {
               res.status(201).json({ success: true, comment: comment })
            }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
         } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]

//TODO: patch & delete
