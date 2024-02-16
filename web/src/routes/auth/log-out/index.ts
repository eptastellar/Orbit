import { checkIfSessionTokenIsValid, logOut } from "@contexts/AuthContext"
import { Request, Response } from "express"

export const GET = [checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const uid: string = res.locals.uid

   logOut(uid).then(() => {
      res.status(200).json({ success: true })
   }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
}]
