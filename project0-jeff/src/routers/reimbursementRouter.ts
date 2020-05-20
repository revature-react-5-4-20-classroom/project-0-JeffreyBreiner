import express, { Router, Request, Response, NextFunction } from "express";
import { getReimbursementByUser, getReimbursementByStatus, submitReimbursement, updateReimbursement, getAllReimbursements } from "../repository/reimbursement-data-access";
import { Reimbursement } from "../models/reimbursements";


export const reimbursementRouter: Router = express.Router();
const EMPLOYEE = 1;
const FINANCE = 2;
const ADMIN = 3;

reimbursementRouter.get('/status/:stasusId', async (req: Request, res: Response, next: NextFunction) => {
    const id = +req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Must include numeric id in path');
    } else if ((req.session) && (req.session.user.role === FINANCE)) {
        try {
            const reimbursements = await getReimbursementByStatus(id);
            res.json(reimbursements);
        } catch (e) {
            console.log("caught error on reimbursementRouter");
            next(e);
        }
    } else {
        res.status(401).send('The incoming token has expired.');
    }
});

reimbursementRouter.get('/author/user_id/:user_id', async (req: Request, res: Response, next: NextFunction) => {
    const id = +req.params.id;
    if (isNaN(id)) {
        res.status(400).send('Must include numeric id in path');
    } else if (((req.session) && (req.session.user.role === FINANCE)) || (req.session && req.session.user.user_id)) {
        try {
            let reimbursements: Reimbursement[] = await getReimbursementByUser(id);
            res.json(reimbursements);
        } catch (e) {
            console.log("caught error on userRouter");
            next(e);
        }
    } else {
        res.status(401).send('The incoming token has expired.');
    }
});

reimbursementRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    if (req.session && (req.session.user.role === FINANCE)) {
        try {
            let reimbursements = await getAllReimbursements();
            res.json(reimbursements);
        } catch (e) {
            next(e);
        }
    } else {
        res.status(401).send('The incomming token has expired');
    }
});

reimbursementRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { reimbursement_id, author, amount, datesubmitted, description, type } = req.body;
    try {
        let reimbursement = await submitReimbursement(reimbursement_id, author, amount, datesubmitted, description, type);
        res.sendStatus(201).send(reimbursement);
    } catch (e) {
        console.log("caught error on reimbursementRouter");
        next(e);
    }
});

reimbursementRouter.patch('/', async (req: Request, res: Response, next: NextFunction) => {
    if ((req.session) && (req.session.user.role === FINANCE)) {
        let reimbursement: Reimbursement = req.body;
        try {
            let newReimbursement = await updateReimbursement(reimbursement.reimbursementId, reimbursement.author, reimbursement.amount, reimbursement.dateSubmitted,
                reimbursement.dateResolved, reimbursement.description, reimbursement.resolver, reimbursement.status, reimbursement.type);
            res.status(201).send(reimbursement);
        } catch (e) {
            next(e);
        }
    } else {
        res.status(401).send('The incomming token has expired');
    }
});