import { interests } from '@assets/interests';
import { NextFunction, Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
   res.json({ interests }).status(200);
});

export default app;
