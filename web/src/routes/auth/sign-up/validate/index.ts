import { Request, Response } from "express"
import { ValidationService } from "services"
import { SignUpValidateRequest, SuccessResponse } from "types"

const valid = new ValidationService()

export const POST = (req: Request, res: Response) => {
   const username: string = req.body.username
   const bday: number = req.body.bday

   const ereq: SignUpValidateRequest = {
      username,
      bday
   }

   valid.usernameValidation(ereq.username).then(() => {
      valid.birthdateValidation(ereq.bday).then(() => {
         const success: SuccessResponse = {
            success: true
         }
         res.status(200).json({
            ...success
         })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}
