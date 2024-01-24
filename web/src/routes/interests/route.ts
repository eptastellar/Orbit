import { interests } from '@assets/interests'
import { Request, Response, Router } from 'express'

const app: Router = Router()

app.get('/', (_: Request, res: Response) => {
   res.status(200).json({ success: true, interests })
})

export default app
