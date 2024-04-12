import { Request, Response } from "express"
import { AuthService, UserService, ValidationService } from "services"

const auth = new AuthService()
const user = new UserService()
const valid = new ValidationService()

export const GET = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {

   const randomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min

   const createRandomString = (length: number): string => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      let result = ""
      const randomArray = new Uint8Array(length)

      randomArray.forEach((number) => {
         result += chars[randomInt(0, chars.length)]
      })
      return result
   }


   const randomNumber: string = createRandomString(16) //TODO: Need changes for more combinations
   user.setRandomFriendCode(res.locals.uid, randomNumber)

   res.status(200).json({ success: true, message: randomNumber })
}]

export const POST = [auth.checkIfSessionTokenIsValid, async (req: Request, res: Response) => {

   const uid: string = res.locals.uid
   const randomNumber: string = req.body.friendCode

   const friendName: string | null = await user.findRandomFriendCode(uid, randomNumber) // Returns null if the connection is not created

   if (friendName === null) res.status(408).json({ success: false, message: "Request Time Out" })
   else res.status(200).json({ success: true, name: friendName })
}]
