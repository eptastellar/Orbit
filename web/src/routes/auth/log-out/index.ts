import { resError } from "config"
import { Request, Response } from "express"
import { AuthService } from "services"
import { SuccessResponse } from "types"

const auth: AuthService = new AuthService()

export const GET = [auth.sessionGuard, (_: Request, res: Response) => {
   try {
      const uid: string = res.locals.uid
      auth.logOut(uid).then((successResponse: SuccessResponse) => {
         res.status(200).json({
            ...successResponse
         })
      })
   } catch (error) { resError(res, error) }
}]
