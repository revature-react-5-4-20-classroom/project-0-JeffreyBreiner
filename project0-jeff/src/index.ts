import express from "express";
import bodyParser from 'body-parser';
import { Application, Request, Response, NextFunction } from "express";
import { sessionMiddleware } from "./middleware/sessionMiddleware";
import { loggingMiddleware } from "./middleware/loggingMiddleware";
import { userRouter } from "./routers/userRouter";
import { connectionPool } from "./repository";
import { PoolClient, QueryResult } from "pg";
import { findUserByUsernamePassword } from "./repository/user-data-access";
import { loginRouter } from "./routers/loginRouter";
import { reimbursementRouter } from "./routers/reimbursementRouter";
import { corsFilter } from "./middleware/corsFilter"

const PORT: number = 6464;
const app: Application = express();

app.use(bodyParser.json());
app.use(sessionMiddleware);
app.use(loggingMiddleware);

app.use('/login', loginRouter);
app.use('/users', userRouter);
app.use('/reimbursements', reimbursementRouter);
app.use(corsFilter);

app.get('/views', (req: Request, res: Response) => {
  console.log(req.session); // try to log it
  if (req.session && req.session.views) {
    req.session.views++;
    res.send(`Reached this endpoint ${req.session.views} times`);
  } else if (req.session) {
    req.session.views = 1;
    res.send('Reached the views endpoint for the first time');
  } else {
    res.send('Reached the views endpoint without a session')
  }
});

app.listen(6464, () => {

  console.log("app has started, testing connection:");
  connectionPool.connect().then(
    (client: PoolClient) => {
      console.log('connected');
      client.query('SELECT * FROM p0users;').then(
        (result: QueryResult) => {
          console.log(result.rows[0]);
        }
      )
    }).catch((err) => {
      console.error(err.message);
    })
});
