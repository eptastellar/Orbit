import { Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   res.json({
      "uptime": process.uptime(),
      "platform": process.platform
   }).status(200)
});

export default app;
