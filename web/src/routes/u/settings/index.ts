import { Request, Response } from "express"
import { AuthService, UserService, ValidationService } from "services"
import { UserSchema } from "types"

const auth = new AuthService()
const user = new UserService()
const valid = new ValidationService()

export const GET = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid

   try {
      const interests: string[] = await user.getInterestsFromUID(uid)
      const userSchema: UserSchema = await user.getUserDatafromUID(uid)

      res.status(200).json({
         interests: interests,
         ...userSchema
      })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]

export const PATCH = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const interests: string[] = req.body.interests
   const username: string = req.body.username
   const name: string = req.body.name
   const pfp: string = req.body.pfp
   const userSchema: UserSchema = { username, name, pfp }

   valid.usernameValidation(username).then(() => {
      valid.interestsValidation(interests).then(() => {
         user.patchUserInfo(uid, interests, userSchema).then(() => {
            res.status(200).json({ success: true })
         }).catch((error) => res.status(500).json({ error: error.message }))
      }).catch((error) => res.status(400).json({ error: error.message }))
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]

export const DELETE = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO @TheInfernalNick delete messages and ecc...

   user.deleteUser(uid).then(() => {
      user.removeBatch("posts", uid).then(() => {
         user.removeBatch("comments", uid).then(() => {
            res.status(200).json({ success: true })
         }).catch((error) => res.status(500).json({ error: error.message }))
      }).catch((error) => res.status(500).json({ error: error.message }))
   }).catch((error) => res.status(500).json({ error: error.message }))
}]
