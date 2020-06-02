import express, { Router, Request, Response, NextFunction } from "express";
import { findUserByUsernamePassword } from "../repository/user-data-access";

export const loginRouter: Router = express.Router();

loginRouter.post('/', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send('Please include username and password fields for login');
    } else {
        try {
            const user = await findUserByUsernamePassword(username, password);
            if (user && req.session) {
                req.session.user = user;
                res.send(user);
            } else if (!user) {
                res.status(400).send("Invalid Credentials");
            }
        } catch (e) {
            res.status(400).send("Invalid Credentials");
        }
    }
});