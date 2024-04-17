import { Request, Response } from "express"
import { ValidationService } from "services"
import { SignUpValidateRequest } from "types"

const valid = new ValidationService()

export const POST = (req: Request, res: Response) => {
   const username: string = req.body.username
   const bday: number = req.body.bday

   const signUpValidateRequest: SignUpValidateRequest = {
      username,
      bday
   }

   valid.usernameValidation(signUpValidateRequest.username).then(() => {
      valid.birthdateValidation(signUpValidateRequest.bday).then(() => {
         res.status(200).json({
            success: true
         })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}
