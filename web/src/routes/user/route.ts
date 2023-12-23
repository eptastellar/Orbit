import { Request, Response, Router } from "express";
const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   res.json({
      "uptime": process.uptime(),
      "status": 200,
      "platform": process.platform
   });
});

export default app;
