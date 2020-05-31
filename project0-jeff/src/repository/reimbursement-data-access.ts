import { connectionPool } from ".";
import { PoolClient, QueryResult } from "pg";
import { Reimbursement } from "../models/reimbursements";



export async function submitReimbursement(author: number, amount: number, dateSubmitted: number, 
    description: string, type: number) {
    let client: PoolClient = await connectionPool.connect();
    try {
    let resolver: QueryResult = await client.query('INSERT INTO p0reimbursement (reimbursement_id, author, amount, datesubmitted, dateresolved, description, resolver, status, "type") VALUES (DEFAULT, $1, $2, $3, -9999, $4, 4, 1, $5)', [author, amount, dateSubmitted, description, type]);
        let returnValue: QueryResult = await client.query('SELECT * FROM p0reimbursement WHERE author = $1 AND datesubmitted = $2;', [author, dateSubmitted]);
        console.log(returnValue);
        let newArray: Reimbursement[] = returnValue.rows.map((u) => {
            return new Reimbursement(u.reimbursement_id, u.author, u.amount, u.datesubmitted, u.dateresolved, u.description, u.resolver, u.status, u.type); //names directly from DB
        });
        return newArray[0];
    } catch (e) {
        throw new Error(`Failed to query for all reimbursements: ${e.message}`);
    } finally {
        client && client.release();
    }
}

export async function getReimbursementByStatus(id: number): Promise<Reimbursement[]> {
    let client: PoolClient;
    client = await connectionPool.connect();
    try {
        let result: QueryResult;
        result = await client.query(`SELECT * FROM p0reimbursement WHERE status = ${id} ORDER BY dateSubmitted DESC;`);
        let newArray: Reimbursement[] = result.rows.map((u) => {
            return new Reimbursement(u.reimbursement_id, u.author, u.amount, u.datesubmitted, u.dateresolved, u.description, u.resolver, u.status, u.type);
        });
        return newArray;
    } catch (e) {
        throw new Error(`Failed to query for all reimbursements: ${e.message}`);
    } finally {
        client && client.release();
    }
}

export async function getReimbursementByUser(id: number): Promise<Reimbursement[]> {
    let client: PoolClient;
    client = await connectionPool.connect();
    try{
        let result: QueryResult;
        result = await client.query(`SELECT * FROM p0reimbursement WHERE author = ${id} ORDER BY dateSubmitted DESC;`);
        let newArray: Reimbursement[] = result.rows.map((u) => {
            return new Reimbursement(u.reimbursement_id, u.author, u.amount, u.datesubmitted, u.dateresolved, u.description, u.resolver, u.status, u.type);
        });
        return newArray;
    } catch (e) {
        throw new Error(`Failed to query for all reimbursements: ${e.message}`);
    } finally {
        client && client.release();
    }
}

export async function updateReimbursement(reimbursement_id: number, author?: number, amount?: number, dateSubmitted?: number, dateResolved?: number, 
    description?: string, resolver?: number, status?: number, type?: number): Promise<Reimbursement[]>{
    let client: PoolClient = await connectionPool.connect();
    try{
        let query:string = ``;
        if(author){
            await client.query('UPDATE p0reimbursement SET author = $1 WHERE reimbursement_id = $2;', [author, reimbursement_id]);
        }
        if(amount){
            await client.query('UPDATE p0reimbursement SET amount = $1 WHERE reimbursement_id = $2;', [amount, reimbursement_id]);
        }
        if(dateSubmitted){
            await client.query('UPDATE p0reimbursement SET dateSubmitted = $1 WHERE reimbursement_id = $2;', [dateSubmitted, reimbursement_id]);
        }
        if(dateResolved){
            await client.query('UPDATE p0reimbursement SET dateResolved = $1 WHERE reimbursement_id = $2;', [dateResolved, reimbursement_id]);
        }
        if(description){
            await client.query('UPDATE p0reimbursement SET description = $1 WHERE reimbursement_id = $2;', [description, reimbursement_id]);
        }
        if(resolver){
            await client.query('UPDATE p0reimbursement SET resolver = $1 WHERE reimbursement_id = $2;', [resolver, reimbursement_id]);
        }
        if(status){
            await client.query('UPDATE p0reimbursement SET status = $1 WHERE reimbursement_id = $2;', [status, reimbursement_id]);
        }
        if(type){
            await client.query('UPDATE p0reimbursement SET "type" = $1 WHERE reimbursement_id = $2;', [type, reimbursement_id]);
        }
        
        let result:QueryResult = await client.query('SELECT * FROM p0reimbursement WHERE reimbursement_id = $1', [reimbursement_id]);
        let userArray:Reimbursement[] = result.rows.map((u) => {
            return new Reimbursement(u.reimbursement_id, u.author, u.amount, u.datesubmitted, u.dateresolved, u.description, u.resolver, u.status, u.type);
        });
        return userArray;
    } catch (e) {
        throw new Error(`Failed to process update query: ${e.message}`);
    } finally {
        client && client.release();
    }
}

export async function getAllReimbursements(): Promise<Reimbursement[]> {
    let client: PoolClient;
    client = await connectionPool.connect();
    try {
        let result: QueryResult;
        result = await client.query(
            `SELECT p0users.user_id, p0users.username, p0users.password, p0users.firstname, p0users.lastname, p0users.email, p0users.role
            FROM p0users INNER JOIN p0roles ON p0users.role = p0roles.role_id;`
        );
        for (let row of result.rows) {
            console.log(row.username);
        }
        return result.rows.map((u) => {
            return new Reimbursement(u.reimbursement_id, u.author, u.amount, u.datesubmitted, u.dateresolved, u.description, u.resolver, u.status, u.type);
        });
    } catch (e) {
        throw new Error(`Failed to query for all users: ${e.message}`);
    } finally {
        client && client.release();
    }
}