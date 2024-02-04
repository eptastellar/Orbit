import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { deletePost, updatePost } from "@contexts/ContentContext"
import { hasPermission } from "@contexts/UserContext"
import { contentValidation, postIdValidation } from "@contexts/ValidationContext"
import { Request, Response } from "express"

export const PATCH = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id
   const text: string = req.body.text
   const type: string = req.body.type
   const content: string = req.body.content

   contentValidation(text, content, type).then(() => {
      postIdValidation(postId).then(() => {
         hasPermission(uid, postId).then(() => {
            updatePost(postId, text, content, type).then((updatedPostId: string) => {
               res.status(200).json({ success: true, post: updatedPostId }) //return the updated post id
            }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]

export const DELETE = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.id

   postIdValidation(postId).then(() => {
      hasPermission(uid, postId).then(() => {
         deletePost(postId).then(() => {
            res.status(200).json({ success: true }) //return a success message
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
