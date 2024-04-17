import { Request, Response } from "express"
import { AuthService, ContentService, UserService, ValidationService } from "services"
import { ContentFetch, PostsRequest } from "types"

const auth = new AuthService()
const user = new UserService()
const valid = new ValidationService()
const cont = new ContentService()

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username
   const last_post_id: string = req.body.last_post_id //retrieve the last fetched document

   const ereq: PostsRequest = {
      last_post_id
   }

   try {
      if (ereq.last_post_id) await valid.postIdValidation(ereq.last_post_id)

      user.getUIDfromUserData(username).then(async (uid: string) => { //get the uid from the username, also validate the username
         user.areFriends(tokenUid, uid).then(() => {
            cont.fetchPosts([uid], ereq.last_post_id, uid).then((contentFetch: ContentFetch) => {
               res.status(200).json({
                  ...contentFetch
               })
            }).catch((error) => { res.status(200).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(404).json({ error: error.message }) })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]
