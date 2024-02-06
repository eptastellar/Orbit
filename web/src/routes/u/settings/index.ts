import { checkIfSessionTokenIsValid } from '@contexts/AuthContext'
import { deleteUser, getInterestsFromUID, getUserDatafromUID, patchUserInfo } from '@contexts/UserContext'
import { interestsValidation, usernameValidation } from '@contexts/ValidationContext'
import { UserInfo } from '@local-types/index'
import { Request, Response } from 'express'

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid

   try {
      const interests: string[] = await getInterestsFromUID(uid)
      const { username, name, pfp } = await getUserDatafromUID(uid)

      res.status(200).json({ interests: interests, username: username, name: name, pfp: pfp })
   } catch (error: any) { res.status(400).json({ message: error.message }) }
}]

export const PATCH = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const interests: string[] = req.body.interests
   const username: string = req.body.username
   const name: string = req.body.name
   const pfp: string = req.body.pfp

   usernameValidation(username).then(() => {
      interestsValidation(interests).then(() => {
         const user: UserInfo = { username, name, pfp }
         patchUserInfo(uid, interests, user)
         res.status(200).json({ success: true })
      })
   }).catch((error: Error) => { res.status(400).json({ success: false, message: error.message }) })
}]

export const DELETE = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO @TheInfernalNick delete messages and ecc...

   deleteUser(uid).then(() =>
      res.status(200).json({ success: true })
   ).catch((error: Error) => res.status(400).json({ success: false, message: error.message }))
}]
