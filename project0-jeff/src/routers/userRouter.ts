import express, { Router, Request, Response, NextFunction } from "express";
import { getAllUsers, addNewUser, getUserById, updateUser } from "../repository/user-data-access";
import { User } from "../models/users";

export const userRouter: Router = express.Router();

const EMPLOYEE = 1;
const FINANCE = 2;
const ADMIN = 3;

userRouter.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' || (req.session && req.session.user && (req.session.user.role == EMPLOYEE || req.session.user.role == FINANCE || req.session.user.role == ADMIN))) {
        console.log("next()");
        next();
    } else {
        res.status(401).send('The incoming token has expired');
    }
});

userRouter.get('/', async (req: Request, res: Response) => {
    if (req.session && req.session.user.role === FINANCE) {
        try {
            const users: User[] = await getAllUsers();
            res.json(users);
        } catch (e) {
            res.sendStatus(404);
        }
    } else if (req.session && (req.session.user.role === EMPLOYEE || req.session.user.role === ADMIN)){
        res.status(401).send('YOU SHALL NOT PASS!!!');
    } else {
        res.status(401).send('The incomming token has expired');
    }
});

userRouter.post('/', async (req: Request, res: Response) => {
    let { id, username, password, firstName, lastName, email, role } = req.body;
    if (id && username && password && email && role) {
        await addNewUser(new User(id, username, password, firstName, lastName, email, role));
        res.sendStatus(201);
    } else {
        res.status(400).send('Please include required fields.');
    }
});

userRouter.patch('/', async (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user.role === ADMIN) {
        let user: User = req.body;
        try {
            let newUser = await updateUser(user.userId, user.username, user.password, user.firstName, user.lastName, user.email, user.role);
            res.status(201).send(newUser);
        } catch (e) {
            next(e);
        }
    } else if (req.session && (req.session.user.role === EMPLOYEE || req.session.user.role === FINANCE)){
        res.status(401).send('You do not have the proper permissions');
    } else {
        res.status(401).send('The incomming token has expired');
    }
});

userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id = +req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Must include numeric id in path');
    } else if (req.session && (req.session.user.role === FINANCE || req.session.user.userId === id)) {
        try {
            const user = await getUserById(id);
            res.json(user);
        }
        catch (e) {
            console.log("caught error on usersRouter");
            next(e);
        }
    } else if (req.session && (req.session.user.role === FINANCE || !(req.session.user.userId === id))) {
        res.status(401).send('You do not have the proper permissions');
    } else {
        res.status(401).send('The incoming token has expired.');
    }
});