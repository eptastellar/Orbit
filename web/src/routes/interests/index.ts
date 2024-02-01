import { interests } from '@assets/interests'
import { Handler, Request, Response } from 'express'

export const GET: Handler = (_: Request, res: Response) => {
   res.status(200).json({ success: true, interests })
}
