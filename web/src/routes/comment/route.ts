import { fetchLeafsComments, fetchRootComments, uploadComment } from '@contexts/ContentContext'
import { isValidCommentRootId, isValidDocId } from '@helpers/validate'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.post('/:postId/:rootId?', async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const postId: string = req.params.postId
   const rootId: string = req.params.rootId
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
})

app.get('/roots/:postId', async (req: Request, res: Response) => {
   const postId: string = req.params.postId
   const lastRootCommentId: string = req.params.lastRootCommentId

   fetchRootComments(postId, lastRootCommentId).then((fetch) => {
      console.log(fetch);
      //TODO
   }).catch((error) => {

   })

})

app.get('/leafs/:rootId', async (req: Request, res: Response) => {
   const rootId: string = req.params.rootId
   const lastLeafCommentId: string = req.params.lastLeafCommentId

   fetchLeafsComments(rootId, lastLeafCommentId).then((fetch) => {
      console.log(fetch);
   }).catch((error) => {
      //TODO
   })
})

//TODO patch e delete
export default app
