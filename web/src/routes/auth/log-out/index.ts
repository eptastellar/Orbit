import { Request, Response } from "express"
import { AuthService } from "services"
import { SuccessResponse } from "types"

const auth = new AuthService()

export const GET = [auth.sessionGuard, (_: Request, res: Response) => {
   const uid: string = res.locals.uid

   auth.logOut(uid).then((success: SuccessResponse) => {
      res.status(200).json({
         ...success
      })
   }).catch((error) => { res.status(500).json({ error: error.message }) })
}]
