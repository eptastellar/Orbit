import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { UserResponse, UserSchema } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   core.getUidFromUserData(username).then(async (uid: string) => { //also validate the username
      auth.areFriendsGuard(tokenUid, uid).then(async () => { //if they are not friends it will reject an error
         core.getUserDataFromUid(uid).then((userSchema: UserSchema) => {
            core.counter(uid, "posts", "owner").then((posts: number) => {
               core.getFriendsCount(uid).then((friends: number) => {
                  core.getMeteorCount(uid).then((meteors: number) => {
                     const userResponse: UserResponse = {
                        personal: tokenUid === uid, //check if is the user personal profile
                        user_data: { ...userSchema },
                        counters: {
                           posts: posts,
                           friends: friends,
                           meteors: meteors,
                        }
                     }

                     res.status(200).json({
                        ...userResponse
                     })
                  }).catch((error) => { res.status(500).json({ error: error.message }) })
               }).catch((error) => { res.status(500).json({ error: error.message }) })
            }).catch((error) => { res.status(500).json({ error: error.message }) })
         }).catch((error) => { res.status(500).json({ error: error.message }) })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
