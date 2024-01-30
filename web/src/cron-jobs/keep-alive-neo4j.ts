import { keepAliveNeo } from '@contexts/CronJobsContext'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.get('/', async (_: Request, res: Response) => {
   keepAliveNeo().then(() => {
      res.status(200).json({ success: true })
   }).catch((error) => { res.status(500).json({ success: false, message: error.message }) })
})

export default app
