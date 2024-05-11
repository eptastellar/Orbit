import { resError } from "config"
import { Request, Response } from "express"
import { AuthService, CronService } from "services"
import { SuccessResponse } from "types"

const auth = new AuthService()
const cron = new CronService()

export const GET = [auth.cronGuard, async (_: Request, res: Response) => {
   try {
      cron.keepAliveNeo().then((successResponse: SuccessResponse) => {
         res.status(200).json({
            ...successResponse
         })
      })
   } catch (error) { resError(res, error) }
}]
