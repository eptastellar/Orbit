import { checkIfCronSecretIsValid } from "@contexts/AuthContext"
import { keepAliveNeo } from "@contexts/CronJobsContext"
import { Request, Response } from "express"

export const GET = [checkIfCronSecretIsValid, async (_: Request, res: Response) => {
   keepAliveNeo().then(() => {
      res.status(200).json({ success: true })
   }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
}]
