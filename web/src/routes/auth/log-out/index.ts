import { Request, Response } from "express"
import { AuthService } from "services"

const auth = new AuthService()

export const GET = [auth.checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const uid: string = res.locals.uid

   auth.logOut(uid).then(() => {
      res.status(200).json({ success: true })
   }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
}]
