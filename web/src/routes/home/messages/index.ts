import { Request, Response } from "express"
import { AuthService } from "services"

const auth = new AuthService()

export const GET = [auth.checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO unreaded messages number
   res.status(200).json({}).status(200)
}]
