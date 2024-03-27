import { checkIfSessionTokenIsValid } from "@contexts/AuthContext"
import { findRandomFriendNumber, setRandomFriendNumber } from "@contexts/UserContext"
import { Request, Response } from "express"

export const GET = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {

   const randomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min

   const randomNumber: number = randomInt(0, 2048) //TODO: Need changes for more combinations
   setRandomFriendNumber(res.locals.uid, randomNumber)

   res.status(200).json({ success: true, message: randomNumber })
}]

export const POST = [checkIfSessionTokenIsValid, async (req: Request, res: Response) => {

   const uid: string = res.locals.uid
   const randomNumber: number = req.body.friendCode

   findRandomFriendNumber(uid, randomNumber)

   res.status(200).json({ success: true })
}]
