import { Request, Response } from "express"
import { AuthService, CronJobsService } from "services"

const auth = new AuthService()
const cron = new CronJobsService()

export const GET = [auth.checkIfCronSecretIsValid, async (_: Request, res: Response) => {
   cron.keepAliveNeo().then(() => {
      res.status(200).json({ success: true })
   }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
}]
