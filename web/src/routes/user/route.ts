import { NextFunction, Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
   console.log(res.locals.jwt);

   res.json({
      "uptime": process.uptime(),
      "status": 200,
      "platform": process.platform
   });
});

export default app;
