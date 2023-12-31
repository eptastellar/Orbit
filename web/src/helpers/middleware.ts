import express, { NextFunction } from "express";

export const middleware = async (req: express.Request, res: express.Response, next: NextFunction) => {
   const authorization = req.headers.authorization

   if (authorization?.startsWith("Bearer ")) {
      //TODO CHECK JWT in the sessions
   } else
      return res.json({ success: false, message: "Unauthorized" }).status(401)
};
