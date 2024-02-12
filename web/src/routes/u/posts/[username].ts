import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { fetchPosts } from "@contexts/ContentContext"
import { areFriends, getUIDfromUserData } from "@contexts/UserContext"
import { postIdValidation } from "@contexts/ValidationContext"
import { ContentFetch } from "@local-types/index"
import { Request, Response } from "express"

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const lastPostId: string = req.body.lastPostId //retrieve the last fetched document
   const username: string = req.params.username

   try {
      if (lastPostId) await postIdValidation(lastPostId)

      getUIDfromUserData(username).then(async (uid: string) => { //get the uid from the username, also validate the username
         areFriends(tokenUid, uid).then(() => {
            fetchPosts([uid], lastPostId, uid).then((fetch: ContentFetch) => {
               res.status(200).json({ success: true, posts: fetch.content, lastPostId: fetch.lastDocId })
            }).catch((error) => { res.status(200).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(404).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
