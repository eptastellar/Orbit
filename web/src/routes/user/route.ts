import { fetchPosts } from '@contexts/ContentContext'
import { areFriends, getFriendCount, getMeteorCount, getPostCount, retrieveUIDFromUsername, retrieveUserDataFromUID } from '@contexts/UserContext'
import { isValidDocId } from '@helpers/validate'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.post('/:username/posts', async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const lastDocId: string = req.body.lastDocId //retrieve the last fetched document

   Promise.all([
      isValidDocId(lastDocId)
   ]).then(() => {
      retrieveUIDFromUsername(req.params.username).then(async (uid: string) => { //get the uid from the username
         areFriends(tokenUid, uid).then(() => {
            fetchPosts([uid], lastDocId).then((fetch) => {
               res.status(200).json({ success: true, posts: fetch.posts, lastDocId: fetch.lastDocId })
            }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
})

app.get('/:username', async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   retrieveUIDFromUsername(username).then(async (uid: string) => {
      areFriends(tokenUid, uid).then(async () => {
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
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
})

export default app
