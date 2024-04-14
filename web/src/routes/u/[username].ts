import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { areFriends, getFriendsCount, getInterestsFromUID, getMeteorCount, getPostCount, getUIDfromUserData, getUserDatafromUID } from "@contexts/UserContext"
import { UserInfo } from "@local-types/index"
import { Request, Response } from "express"

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   try {
      getUIDfromUserData(username).then(async (uid: string) => { //also validate the username
         areFriends(tokenUid, uid).then(async () => { //if they are not friends it will reject an error
            getUserDatafromUID(uid).then((user: UserInfo) => {
               getInterestsFromUID(uid).then((interests: string[]) => {
                  getPostCount(uid).then((post_count: number) => {
                     getFriendsCount(uid).then((friends_count: number) => {
                        getMeteorCount(uid).then((meteor_count: number) => {
                           res.status(200).json({
                              success: true,
                              personal: tokenUid == uid, //check if is the user personal profile
                              username: user.username,
                              name: user.name,
                              pfp: user.pfp,
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
