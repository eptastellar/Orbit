import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"
import { IdResponse, SuccessResponse, UserSchema } from "types"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (_: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid

      core.getUserDataFromUid(uid).then((userSchema: UserSchema) => {
         res.status(200).json({
            ...userSchema
         })
      })
   } catch (error) { resError(res, error) }
}]

export const PATCH = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
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

      await valid.usernameValidation(ereq.username)
      await valid.interestsValidation(ereq.interests!)
      await valid.mediaValidation(pfp)
      core.updateUserInfo(uid, ereq).then((idResponse: IdResponse) => {
         res.status(200).json({
            ...idResponse
         })
      })
   } catch (error) { resError(res, error) }
}]

export const DELETE = [auth.sessionGuard, async (_: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid

      await core.deleteUser(uid)
      await core.removeBatch("posts", uid)
      await core.removeBatch("comments", uid)

      const successResponse: SuccessResponse = {
         success: true
      }
      res.status(200).json({
         ...successResponse
      })
   } catch (error) { resError(res, error) }
}]
