import { birthdateValidation, usernameValidation } from "@contexts/ValidationContext";
import { Request, Response } from "express";

export const POST = (req: Request, res: Response) => {
   const username: string = req.body.username
   const bday: number = req.body.bday

   usernameValidation(username).then(() => {
      birthdateValidation(bday).then(() => {
         res.status(200).json({ success: true })
      }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
   }).catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}
