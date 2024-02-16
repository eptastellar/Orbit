import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { Request, Response } from "express"

export const GET = [checkIfSessionTokenIsValid, (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO unreaded messages number
   res.status(200).json({}).status(200)
}]
