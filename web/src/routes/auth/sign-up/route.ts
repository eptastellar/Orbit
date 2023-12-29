import { NextFunction, Request, Response, Router } from "express";

const app: Router = Router();

app.post("/", (req: Request, res: Response, next: NextFunction) => {
   //TODO @TheInfernalNick crea nodo

   // res.json({ success: true, message: "Node created" }).status(201);
   res.json({ success: false, message: "Error while creating the node" }).status(400);
});

export default app;
