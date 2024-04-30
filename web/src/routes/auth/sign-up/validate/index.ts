import { resError } from "config"
import { Request, Response } from "express"
import { ValidationService } from "services"
import { SignUpValidateRequest, SuccessResponse } from "types"

const valid: ValidationService = new ValidationService()

export const POST = async (req: Request, res: Response) => {
   try {
      const username: string = req.body.username
      const bday: number = req.body.bday

      const ereq: SignUpValidateRequest = {
         username,
         bday
      }

      await valid.usernameValidation(ereq.username)
      await valid.birthdateValidation(ereq.bday)
      const success: SuccessResponse = {
         success: true
      }
      res.status(200).json({
         ...success
      })
   } catch (error) { resError(res, error) }
}
