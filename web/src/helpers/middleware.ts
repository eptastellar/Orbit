import express, { NextFunction } from "express";
import { baas } from "../lib/firebase-admin.config";
import admin from "firebase-admin"

export const middleware = async (req: express.Request, res: express.Response, next: NextFunction) => {

   console.log(req.baseUrl)
   console.log(req.headers.authorization);
   const authorization = req.headers.authorization

   if (authorization?.startsWith("Bearer ")) {
      try {
         baas()
         const idToken = authorization.split("Bearer ")[1];
         const decodedToken = await admin.auth().verifyIdToken(idToken);
         const uid = decodedToken.uid;
         next()
      } catch (error) {
         return res.json({ success: false, status: 401, message: "Unauthorized" })
      }
   }
   return res.json({ success: false, status: 401, message: "Unauthorized" })
};
