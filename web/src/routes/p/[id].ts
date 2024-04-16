import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { PostSchema } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const user = new UserService()
const cont = new ContentService()

export const GET = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id

   valid.postIdValidation(postId).then(() => {
      user.hasPermission(uid, postId, "posts").then(() => {
         cont.getPost(uid, postId).then((post: PostSchema) => {
            res.status(200).json({
               success: true,
               ...post
            }) //return the post
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]

export const PATCH = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id
   const text: string = req.body.text
   const type: string = req.body.type
   const content: string = req.body.content

   valid.contentValidation(text, content, type).then(() => {
      valid.postIdValidation(postId).then(() => {
         user.hasPermission(uid, postId, "posts").then(() => {
            cont.updatePost(postId, text, content, type).then((updatedPostId: string) => {
               res.status(200).json({ success: true, post: updatedPostId }) //return the updated post id
            }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]

export const DELETE = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id

   valid.postIdValidation(postId).then(() => {
      user.hasPermission(uid, postId, "posts").then(() => {
         cont.deletePost(postId).then(() => {
            res.status(200).json({ success: true }) //return a success message
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
