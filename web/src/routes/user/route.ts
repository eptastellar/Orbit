import { NextFunction, Request, Response, Router } from "express";
import { supernova } from "../../algorithms/supernova";

const app: Router = Router();

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
   console.log(res.locals.jwt);

   res.json({
      "uptime": process.uptime(),
      "status": 200,
      "platform": process.platform,
      "result": await supernova("Test")
   });
});

export default app;
