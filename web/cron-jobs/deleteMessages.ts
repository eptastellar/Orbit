import { Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   //TODO
   res.json({}).status(200)
});

export default app;
