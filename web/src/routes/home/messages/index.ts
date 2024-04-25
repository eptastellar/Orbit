import { Request, Response } from "express"
import { AuthService, CoreService, ValidationService } from "services"

const auth: AuthService = new AuthService()
const valid: ValidationService = new ValidationService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   //TODO unreaded messages number
   res.status(200).json({}).status(200)
}]
