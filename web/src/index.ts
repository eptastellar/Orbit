import { middleware } from '@helpers/middleware';
import signup from '@routes/auth/sign-up/route';
import health from '@routes/health/route';
import interests from '@routes/interests/route';
import user from '@routes/user/route';
import dotenv from 'dotenv';
import express, { Express } from 'express';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use('/api/health', health)
app.use('/api/auth/sign-up', middleware, signup)
app.use('/api/interests', interests)
app.use('/api/user', middleware, user)
app.use('*', (_, res) => { res.end('404 not found').status(404) })

app.listen(port, () => { console.log(`⚡[server]: server is running on port: http://localhost:${port}`) }) //TODO REMOVE IN PRODUCTION

export default app
