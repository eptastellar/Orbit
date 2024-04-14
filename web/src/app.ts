import cors from "cors"
import dotenv from "dotenv"
import express, { Express } from "express"
import { router } from "express-file-routing"

dotenv.config()
const app: Express = express()

app.use(cors()) //TODO change to vercel domain and cronjob domain
app.use(express.json())
router().then((router) => app.use("/", router))

app.listen(process.env.PORT, () => { console.log(`⚡[server]: server is running on port: http://localhost:${process.env.PORT}`) })
