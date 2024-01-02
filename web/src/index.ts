import { checkIfSessionTokenIsValid } from '@helpers/middlewares';
import signin from '@routes/auth/sign-in/route';
import signup from '@routes/auth/sign-up/route';
import interests from '@routes/interests/route';
import post from '@routes/post/route';
import api from '@routes/route';
import user from '@routes/user/route';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/api/', api)
app.use('/api/auth/sign-in', signin)
app.use('/api/auth/sign-up', signup)
app.use('/api/interests', interests)
app.use('/api/user', checkIfSessionTokenIsValid, user)
app.use('/api/post', checkIfSessionTokenIsValid, post)

app.set('view engine', 'ejs');
app.use('*', (_: Request, res: Response) => { res.render('404') })

app.listen(port, () => { console.log(`⚡[server]: server is running on port: http://localhost:${port}`) }) //TODO REMOVE IN PRODUCTION
