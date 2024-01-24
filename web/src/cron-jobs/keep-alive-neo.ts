import neo4j from "@config/neo4j.config";
import { Request, Response, Router } from "express";

const app: Router = Router();

app.get("/", async (req: Request, res: Response) => {
   //TODO
   const query = "MATCH (c:Cron) RETURN c"
   let node;
   if (neo4j) {
      try {
         const result = await neo4j.executeRead(tx => tx.run(query))
         node = result.records.map(row => row.get('c'))
         res.json({ status: 200, node: node[0] })
      } catch (error) { res.json({ status: 500 }) }
   }
});

export default app;
