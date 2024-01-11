import { interests } from '@assets/interests';
import { Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", (_: Request, res: Response) => {
   res.json({ success: true, status: 200, interests })
});

export default app;
