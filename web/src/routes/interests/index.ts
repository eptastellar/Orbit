import { interests } from "assets"
import { resError } from "config"
import { Request, Response } from "express"
import { InterestsResponse } from "types"

export const GET = (_: Request, res: Response) => {
   try {
      const interestsResponse: InterestsResponse = {
         interests
      }
      res.status(200).json({
         ...interestsResponse
      })
   } catch (error) { resError(res, error) }
}
