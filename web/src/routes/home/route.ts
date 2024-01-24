import { fetchPosts } from '@contexts/ContentContext'
import { getFriendList } from '@contexts/UserContext'
import { isValidLastDocId } from '@helpers/validate'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.get('/unreaded-messages', (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO
   // unreaded messages number
   res.json({}).status(200)
})

app.post('/posts', async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const lastDocId: string = req.body.lastDocId

   isValidLastDocId(lastDocId).then(async () => {
      const friendList: string[] = await getFriendList(uid)
      fetchPosts(friendList, lastDocId).then((fetch) => {
         res.json({ success: true, posts: fetch.posts, lastDocId: fetch.lastDocId })
      }).catch((error) => { res.json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

export default app
