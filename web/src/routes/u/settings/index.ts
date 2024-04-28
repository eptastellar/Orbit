import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { IdResponse, SuccessResponse, UserSchema } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (_: Request, res: Response) => {
   const uid: string = res.locals.uid

   try {
      const userSchema: UserSchema = await core.getUserDataFromUid(uid)

      res.status(200).json({
         ...userSchema
      })
   } catch (error: any) { res.status(400).json({ error: error.message }) }
}]

export const PATCH = [auth.sessionGuard, async (req: Request, res: Response) => {
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
         valid.mediaValidation(pfp).then(() => {
            core.updateUserInfo(uid, ereq).then((idResponse: IdResponse) => {
               res.status(200).json({
                  ...idResponse
               })
            }).catch((error: Error) => res.status(500).json({ error: error.message }))
         }).catch((error: Error) => res.status(400).json({ error: error.message }))
      }).catch((error: Error) => res.status(400).json({ error: error.message }))
   }).catch((error: Error) => { res.status(400).json({ error: error.message }) })
}]

export const DELETE = [auth.sessionGuard, async (_: Request, res: Response) => {
   const uid: string = res.locals.uid

   core.deleteUser(uid).then(() => {
      core.removeBatch("posts", uid).then(() => {
         core.removeBatch("comments", uid).then(() => {
            const successResponse: SuccessResponse = {
               success: true
            }

            res.status(200).json({
               ...successResponse
            })
         }).catch((error: Error) => res.status(500).json({ error: error.message }))
      }).catch((error: Error) => res.status(500).json({ error: error.message }))
   }).catch((error: Error) => res.status(500).json({ error: error.message }))
}]
