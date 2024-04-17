import { Request, Response } from "express"
import { AuthService, ContentService, ValidationService } from "services"
import { ContentFetch, LeafCommentsRequest } from "types"

const auth = new AuthService()
const cont = new ContentService()
const valid = new ValidationService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const root_id: string = req.params.id
   const last_leaf_comment_id: string = req.body.last_leaf_comment_id
   const post_id: string = req.body.post_id

   const leafCommentsRequest: LeafCommentsRequest = {
      root_id,
      last_leaf_comment_id,
      post_id
   }

   try {
      if (leafCommentsRequest.last_leaf_comment_id) await valid.commentLeafIdValidation(leafCommentsRequest.last_leaf_comment_id, leafCommentsRequest.root_id, leafCommentsRequest.post_id)

      valid.postIdValidation(leafCommentsRequest.post_id).then(async () => {
         valid.commentRootIdValidation(leafCommentsRequest.root_id, leafCommentsRequest.post_id).then(() => {
            cont.fetchLeafsComments(leafCommentsRequest.root_id, leafCommentsRequest.last_leaf_comment_id).then((contentFetch: ContentFetch) => {
               res.status(200).json({
                  ...contentFetch
               })
            }).catch((error) => { res.status(404).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]
