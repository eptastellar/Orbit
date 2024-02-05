import { Request, Response } from "express"

export const POST = async (_: Request, res: Response) => {
   res.status(404).json({ success: false, message: '404: not found' })
}
export const GET = async (_: Request, res: Response) => {
   res.status(404).json({ success: false, message: '404: not found' })
}
export const PATCH = async (_: Request, res: Response) => {
   res.status(404).json({ success: false, message: '404: not found' })
}
export const PUT = async (_: Request, res: Response) => {
   res.status(404).json({ success: false, message: '404: not found' })
}
export const DELETE = async (_: Request, res: Response) => {
   res.status(404).json({ success: false, message: '404: not found' })
}
