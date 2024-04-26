import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { IdResponse, PostRequest, PostResponse } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const post_id: string = req.params.id

   valid.documentIdValidation(post_id, "posts").then(() => {
      core.getOwner(post_id, "posts").then((ownerUid: string) => {
         auth.areFriendsGuard(uid, ownerUid).then(() => {
            core.getPost(uid, post_id).then((postResponse: PostResponse) => {
               res.status(200).json({
                  ...postResponse //return the post
               })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]

export const PATCH = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const post_id: string = req.params.id
   const text: string = req.body.text
   const type: string = req.body.type
   const content: string = req.body.content

   const ereq: PostRequest = {
      text,
      type,
      content
   }

   valid.contentValidation(ereq.text, ereq.content, ereq.type).then(() => {
      valid.documentIdValidation(post_id, "posts").then(() => {
         auth.hasPermissionGuard(uid, post_id, "posts").then(() => {
            core.updatePost(post_id, ereq.text, ereq.content, ereq.type).then((idResponse: IdResponse) => {
               res.status(200).json({
                  ...idResponse //return the updated post id
               })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]

export const DELETE = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const post_id: string = req.params.id

   valid.documentIdValidation(post_id, "posts").then(() => {
      auth.hasPermissionGuard(uid, post_id, "posts").then(() => {
         core.delete(post_id, "posts").then((idResponse: IdResponse) => {
            res.status(200).json({
               ...idResponse
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
