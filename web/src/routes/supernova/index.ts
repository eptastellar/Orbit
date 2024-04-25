import { Request, Response } from "express"
import { AuthService, CoreService } from "services"
import { SupernovaResponse } from "types"

const auth: AuthService = new AuthService()
const core: CoreService = new CoreService()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {

   core.checkSupernovaFriendship(res.locals.uid).then((response) =>
      res.status(200).json({ success: true, message: response })
   ).catch((error: Error) => { res.status(404).json({ success: false, message: error.message }) })

}]

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {

   const username: string = res.locals.uid
   const accepted: boolean = req.body.accepted

   const userData: SupernovaResponse = { username: req.body.username, status: req.body.status, oneway: req.body.oneway }
   core.oneWaySupernovaFriendship(username, userData, accepted).then(
      (code: string) => {
         res.status(200).json({ success: true, message: code })
      }
   ).catch((error: Error) => {
      res.status(200).json({ success: false, message: error.message })
   })
}]
