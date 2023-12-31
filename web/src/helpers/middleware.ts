import { baas } from "@config/firebase-admin.config";
import express, { NextFunction } from "express";
import admin from "firebase-admin";

export const middleware = async (req: express.Request, res: express.Response, next: NextFunction) => {
   const authorization = req.headers.authorization

   if (authorization?.startsWith("Bearer ")) {
      try {
         baas()
         const jwt = authorization.split("Bearer ")[1]
         const decodedjwt = await admin.auth().verifyIdToken(jwt)
         res.locals.jwt = decodedjwt;
         next()
      } catch (error) {
         return res.json({ success: false, message: "Unauthorized" }).status(401)
      }
   } else
      return res.json({ success: false, message: "Unauthorized" }).status(401)
};
