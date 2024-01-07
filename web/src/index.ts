import deleteMessages from '@cron-jobs/deleteMessages';
import { checkIfSessionTokenIsValid, cronSecretIsValid } from '@helpers/middlewares';
import signin from '@routes/auth/sign-in/route';
import signup from '@routes/auth/sign-up/route';
import home from '@routes/home/route';
import interests from '@routes/interests/route';
import post from '@routes/post/route';
import api from '@routes/route';
import user from '@routes/user/route';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors()) //TODO change to vercel domain
app.use(express.json())

app.use('/', api)
app.use('/auth/sign-in', signin)
app.use('/auth/sign-up', signup)
app.use('/interests', interests)
app.use('/user', checkIfSessionTokenIsValid, user)
app.use('/home', checkIfSessionTokenIsValid, home)
app.use('/post', checkIfSessionTokenIsValid, post)

app.use('/cron/delete-messages', cronSecretIsValid, deleteMessages)

app.set('view engine', 'ejs');
app.use('*', (_: Request, res: Response) => { res.render('404') })

app.listen(port, () => { console.log(`⚡[server]: server is running on port: http://localhost:${port}`) }) //TODO REMOVE IN PRODUCTION
