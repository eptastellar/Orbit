import { Request, Response, Router } from 'express'

const app: Router = Router()

app.get('/', (_: Request, res: Response) => {
   res.status(200).json({
      success: true,
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      node: process.version
   })
})

export default app
