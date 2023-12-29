import dotenv from 'dotenv';
import express, { Express } from 'express';
import { middleware } from '../src/helpers/middleware';
import signup from './routes/auth/sign-up/route';
import health from './routes/health/route';
import user from './routes/user/route';
import interests from './routes/interests/route';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use('/health', health)
app.use('/auth/sign-up', middleware, signup)
app.use('/interests', interests)
app.use('/user', middleware, user)

app.listen(port, () => { console.log(`⚡[server]: server is running on port: http://localhost:${port}`) }) //TODO REMOVE IN PRODUCTION

export default app
