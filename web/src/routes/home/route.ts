import { Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", (req: Request, res: Response) => {
   //TODO
   // unreaded messages number
   // get the list of my friends from neo
   // posts of friends ordered by date of creation
   res.json({}).status(200)
});

export default app;
