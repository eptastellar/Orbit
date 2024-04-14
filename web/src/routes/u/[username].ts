import { Request, Response } from "express"
import { AuthService, UserService } from "services"
import { UserInfo } from "types"

const auth = new AuthService()
const user = new UserService()

export const GET = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   try {
      user.getUIDfromUserData(username).then(async (uid: string) => { //also validate the username
         user.areFriends(tokenUid, uid).then(async () => { //if they are not friends it will reject an error
            user.getUserDatafromUID(uid).then((userInfo: UserInfo) => {
               user.getInterestsFromUID(uid).then((interests: string[]) => {
                  user.getPostCount(uid).then((post_count: number) => {
                     user.getFriendsCount(uid).then((friends_count: number) => {
                        user.getMeteorCount(uid).then((meteor_count: number) => {
                           res.status(200).json({
                              success: true,
                              personal: tokenUid == uid, //check if is the user personal profile
                              username: userInfo.username,
                              name: userInfo.name,
                              pfp: userInfo.pfp,
                              interests: interests,
                              counters: {
                                 post_count: post_count,
                                 friends_count: friends_count,
                                 meteor_count: meteor_count,
                              }
                           })
                        }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
                     }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
                  }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
               }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
            }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
