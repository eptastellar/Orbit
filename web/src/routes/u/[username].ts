import { checkIfSessionTokenIsValid } from '@contexts/AuthContext'
import { areFriends, getFriendCount, getMeteorCount, getPostCount, getUIDfromUserData, getUserDatafromUID } from '@contexts/UserContext'
import { Request, Response } from 'express'

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   getUIDfromUserData(username).then(async (uid: string) => {
      areFriends(tokenUid, uid).then(async () => {
         const { username, name, pfp } = await getUserDatafromUID(uid)

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
}]
