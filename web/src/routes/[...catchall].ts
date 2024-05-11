import { Request, Response } from "express"

const error = { message: "server/404" } //TODO add error type

export const POST = async (_: Request, res: Response) => { res.status(404).json({ error: error.message }) }
export const GET = async (_: Request, res: Response) => { res.status(404).json({ error: error.message }) }
export const PATCH = async (_: Request, res: Response) => { res.status(404).json({ error: error.message }) }
export const PUT = async (_: Request, res: Response) => { res.status(404).json({ error: error.message }) }
export const DELETE = async (_: Request, res: Response) => { res.status(404).json({ error: error.message }) }
