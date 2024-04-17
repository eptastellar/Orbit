import { Request, Response } from "express"
import { AuthService, UserService, ValidationService } from "services"
import { IdResponse, SuccessResponse, UserSchema } from "types"

const auth = new AuthService()
const user = new UserService()
const valid = new ValidationService()

export const GET = [auth.checkIfSessionTokenIsValid, async (_: Request, res: Response) => {
   const uid: string = res.locals.uid

   try {
      const interests: string[] = await user.getInterestsFromUID(uid)
      const temp: UserSchema = await user.getUserDatafromUID(uid)

      const userSchema: UserSchema = {
         interests,
         ...temp
      }

      res.status(200).json({
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

   const ereq: UserSchema = {
      username,
      name,
      pfp,
      interests
   }

   valid.usernameValidation(ereq.username).then(() => {
      valid.interestsValidation(ereq.interests!).then(() => {
         user.patchUserInfo(uid, ereq).then((idResponse: IdResponse) => {
            res.status(200).json({
               ...idResponse
            })
         }).catch((error) => res.status(500).json({ error: error.message }))
      }).catch((error) => res.status(400).json({ error: error.message }))
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]

export const DELETE = [auth.checkIfSessionTokenIsValid, async (_: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO @TheInfernalNick delete messages and ecc...

   user.deleteUser(uid).then(() => {
      user.removeBatch("posts", uid).then(() => {
         user.removeBatch("comments", uid).then(() => {
            const successResponse: SuccessResponse = {
               success: true
            }

            res.status(200).json({
               ...successResponse
            })
         }).catch((error) => res.status(500).json({ error: error.message }))
      }).catch((error) => res.status(500).json({ error: error.message }))
   }).catch((error) => res.status(500).json({ error: error.message }))
}]
