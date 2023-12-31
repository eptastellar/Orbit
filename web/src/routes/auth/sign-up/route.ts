import { NextFunction, Request, Response, Router } from "express";
import neo4j from "../../../lib/neo4j.config";

const app: Router = Router();

app.post("/", (req: Request, res: Response, next: NextFunction) => {
   //TODO @Mxzynvuel dammi dati veri cosi so come aggiungere i dati nella query effettivamente
   let interests = ""
   let bday = ""
   const query = `CREATE (:User {name:"${name}",interests:${interests},bday:${bday}})`
   if (neo4j) {
      const result = neo4j.executeWrite(tx => tx.run(query))
   }
   // res.json({ success: true, message: "Node created" }).status(201);
   res.json({ success: false, message: "Error while creating the node" }).status(400);
});

export default app;
