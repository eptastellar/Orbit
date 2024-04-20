import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { IdResponse, PostRequest, PostResponse } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const user = new UserService()
const cont = new ContentService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const post_id: string = req.params.id

   valid.postIdValidation(post_id).then(() => {
      cont.getPostOwner(post_id).then((ownerUID: string) => {
         user.areFriends(uid, ownerUID).then(() => {
            cont.getPost(uid, post_id).then((postResponse: PostResponse) => {
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
      valid.postIdValidation(post_id).then(() => {
         user.hasPermission(uid, post_id, "posts").then(() => {
            cont.updatePost(post_id, ereq.text, ereq.content, ereq.type).then((idResponse: IdResponse) => {
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

   valid.postIdValidation(post_id).then(() => {
      user.hasPermission(uid, post_id, "posts").then(() => {
         cont.deletePost(post_id).then((idResponse: IdResponse) => {
            res.status(200).json({
               ...idResponse
            })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
