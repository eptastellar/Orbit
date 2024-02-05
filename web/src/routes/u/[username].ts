import { checkIfSessionTokenIsValid } from '@contexts/AuthContext'
import { areFriends, getFriendsCount, getInterestsFromUID, getMeteorCount, getPostCount, getUIDfromUserData, getUserDatafromUID } from '@contexts/UserContext'
import { Request, Response } from 'express'

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const tokenUid: string = res.locals.uid
   const username: string = req.params.username

   try {
      getUIDfromUserData(username).then(async (uid: string) => { //also validate the username
         areFriends(tokenUid, uid).then(async () => { //if they are not friends it will reject an error
            const { username, name, pfp } = await getUserDatafromUID(uid)
            const interests: string[] = await getInterestsFromUID(uid)

            res.status(200).json({
               success: true,
               personal: tokenUid == uid, //check if is the user personal profile
               username: username,
               name: name,
               pfp: pfp,
               interests: interests,
               counters: {
                  post_count: await getPostCount(uid),
                  friends_count: await getFriendsCount(uid),
                  meteor_count: await getMeteorCount(uid),
               }
            })
         }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   } catch (error: any) { res.status(400).json({ success: false, message: error.message }) }
}]
