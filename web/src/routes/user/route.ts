import { retriveUserDataFromUsername } from "@helpers/retriver";
import { Request, Response, Router } from "express";

const app: Router = Router();

app.get("/:username", async (req: Request, res: Response) => {
   const tokenUid = res.locals.uid
   const username = req.params.username
   retriveUserDataFromUsername(username).then((uid) => {
      if (tokenUid == uid) {
         //personal profile
      } else {
         // not my profile
      }
      console.log(uid);
   }).catch((error: Error) => {
      res.json({ success: false, message: error.message }).status(400);
   })
});


app.get("/posts", (req: Request, res: Response) => {
   //TODO
   const uid = res.locals.uid

   res.json({});
});

export default app;
