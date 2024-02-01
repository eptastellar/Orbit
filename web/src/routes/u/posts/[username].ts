import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { fetchPosts } from "@contexts/ContentContext"
import { areFriends, retrieveUIDFromUsername } from "@contexts/UserContext"
import { isValidDocId } from "@contexts/ValidationContext"
import { Request, Response } from "express"

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const lastDocId: string = req.body.lastDocId //retrieve the last fetched document
   const username: string = req.params.username

   Promise.all([
      isValidDocId(lastDocId)
   ])
      .then(() => {
         retrieveUIDFromUsername(username).then(async (uid: string) => { //get the uid from the username
            areFriends(tokenUid, uid).then(() => {
               fetchPosts([uid], lastDocId).then((fetch) => {
                  res.status(200).json({ success: true, posts: fetch.posts, lastDocId: fetch.lastDocId })
               }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
            }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}]
