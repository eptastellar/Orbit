import { isValidBday, isValidSignUpUsername } from "@contexts/ValidationContext";
import { Handler, Request, Response } from "express";

export const POST: Handler = (req: Request, res: Response) => {
   const username: string = req.body.username
   const bday: number = req.body.bday

   Promise.all([
      isValidSignUpUsername(username),
      isValidBday(bday)
   ])
      .then(() => { res.status(200).json({ success: true }) })
      .catch((error) => { res.status(400).json({ success: false, message: error.message }) })
}
