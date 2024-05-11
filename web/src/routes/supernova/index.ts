import { SupernovaAlgorithm } from "algorithms"
import { resError } from "config"
import { Request, Response } from "express"
import { AuthService } from "services"
import { SupernovaResponse } from "types"

const auth: AuthService = new AuthService()
const supe: SupernovaAlgorithm = new SupernovaAlgorithm()

export const GET = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      supe.checkSupernovaFriendship(res.locals.uid).then((supernovaResponse: SupernovaResponse) => {
         res.status(200).json({
            ...supernovaResponse
         })
      })
   } catch (error) { resError(res, error) }
}]

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   try {
      const username: string = res.locals.uid
      const accepted: boolean = req.body.accepted

      //TODO need fix
      const userData: SupernovaResponse = { username: req.body.username, status: req.body.status, oneway: req.body.oneway }
      supe.oneWaySupernovaFriendship(username, userData, accepted).then(
         (code: string) => {
            res.status(200).json({ success: true, message: code })
         }
      ).catch((error: Error) => {
         res.status(200).json({ success: false, message: error.message })
      })
   } catch (error) { resError(res, error) }
}]
