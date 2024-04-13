import { supernova } from "algorithms"
import { Request, Response } from "express"

export const GET = async (_: Request, res: Response) => {
   res.status(200).json({
      success: true,
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      node: process.version,
      supernova: await supernova("8DBxwxXYIhSnyJEeFtY20nQaoBa2")
   })
}
