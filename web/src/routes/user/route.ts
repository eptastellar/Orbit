import { NextFunction, Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
   console.log(res.locals.uid);
   res.json({});
});

export default app;
