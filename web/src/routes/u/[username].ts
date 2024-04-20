import { Request, Response } from "express"
import { AuthService, UserService } from "services"
import { UserResponse, UserSchema } from "types"

const auth = new AuthService()
const user = new UserService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   user.getUIDfromUserData(username).then(async (uid: string) => { //also validate the username
      user.areFriends(tokenUid, uid).then(async () => { //if they are not friends it will reject an error
         user.getUserDatafromUID(uid).then((userSchema: UserSchema) => {
            user.getInterestsFromUID(uid).then((interests: string[]) => {
               user.getPostCount(uid).then((posts: number) => {
                  user.getFriendsCount(uid).then((friends: number) => {
                     user.getMeteorCount(uid).then((meteors: number) => {
                        const user_data: UserSchema = {
                           ...userSchema,
                           interests
                        }

                        const userResponse: UserResponse = {
                           personal: tokenUid === uid, //check if is the user personal profile
                           user_data: { ...user_data },
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
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
