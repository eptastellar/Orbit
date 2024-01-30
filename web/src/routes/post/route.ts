import { deletePost, updatePost, uploadPost } from '@contexts/ContentContext'
import { hasPermission } from '@contexts/UserContext'
import { isValidContentType } from '@helpers/validate'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.post('/', async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const type: string = req.body.type
   const content: string = req.body.content

   Promise.all([
      isValidContentType(content, type)
   ])
      .then(() => {
         uploadPost(uid, type, content).then((postId) => {
            res.status(201).json({ success: true, post: postId }) //return the post id
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

app.patch('/:postId', async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.postId
   const type: string = req.body.type
   const content: string = req.body.content

   Promise.all([
      isValidContentType(content, type),
      hasPermission(uid, postId)
   ])
      .then(() => {
         updatePost(postId, content, type).then((updatedPostId: string) => {
            res.status(200).json({ success: true, post: updatedPostId }) //return the updated post id
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

app.delete('/:postId', async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.postId

   Promise.all([
      hasPermission(uid, postId),
   ])
      .then(() => {
         deletePost(postId).then(() => {
            res.status(200).json({ success: true }) //return a success message
         }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

export default app
