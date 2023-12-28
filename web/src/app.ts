import dotenv from 'dotenv';
import express, { Express } from 'express';
import api from './routes/route';
import user from './routes/user/route';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use('/api', api)
app.use('/api/user', user) //TODO: RIMETTI IL middleware

app.listen(port, () => { console.log(`⚡[server]: server is running on port: http://localhost:${port}`) }) //TODO REMOVE IN PRODUCTION

export default app
