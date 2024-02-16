import { Request, Response } from "express"

const message = { success: false, message: "404 Not Found" }

export const POST = async (_: Request, res: Response) => { res.status(404).json(message) }
export const GET = async (_: Request, res: Response) => { res.status(404).json(message) }
export const PATCH = async (_: Request, res: Response) => { res.status(404).json(message) }
export const PUT = async (_: Request, res: Response) => { res.status(404).json(message) }
export const DELETE = async (_: Request, res: Response) => { res.status(404).json(message) }
