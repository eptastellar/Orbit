import { interests } from "assets"
import { Request, Response } from "express"
import { InterestsResponse } from "types"

export const GET = (_: Request, res: Response) => {
   const interestsResponse: InterestsResponse = {
      interests
   }
   res.status(200).json({
      ...interestsResponse
   })
}
