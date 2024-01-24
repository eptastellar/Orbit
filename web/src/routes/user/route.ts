import { fetchPosts } from '@contexts/ContentContext'
import { getFriendCount, getMeteorCount, getPostCount, retrieveUIDFromUsername, retrieveUserDataFromUID } from '@contexts/UserContext'
import { isValidLastDocId } from '@helpers/validate'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.post('/:username/posts', async (req: Request, res: Response) => {
   const lastDocId: string = req.body.lastDocId //retrieve the last fetched document

   isValidLastDocId(lastDocId).then(() => {
      retrieveUIDFromUsername(req.params.username).then(async (uid: string) => { //get the uid from the username
         fetchPosts([uid], lastDocId).then((fetch) => {
            res.status(200).json({ success: true, posts: fetch.posts, lastDocId: fetch.lastDocId })
         }).catch((error) => { res.json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

app.get('/:username', async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   retrieveUIDFromUsername(username).then(async (uid: string) => {
      const { username, name, pfp } = await retrieveUserDataFromUID(uid)

      res.status(200).json({
         success: true,
         personal: tokenUid == uid, //check if is the user personal profile
         username: username,
         name: name,
         pfp: pfp,
         counters: {
            post_count: await getPostCount(uid),
            friend_count: await getFriendCount(uid),
            meteor_count: await getMeteorCount(uid),
         }
      })
   }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
})

export default app
