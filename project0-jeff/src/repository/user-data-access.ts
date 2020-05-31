import { connectionPool } from ".";
import { User } from "../models/users";
import { PoolClient, QueryResult } from "pg";

export async function getAllUsers(): Promise<User[]> {
    let client: PoolClient;
    client = await connectionPool.connect();
    try {
        let result: QueryResult;
        result = await client.query(
            `SELECT user_id, username, password, firstname, lastname, email, role
            FROM p0users INNER JOIN p0roles ON p0users.role = p0roles.role_id;`
        );
        for (let row of result.rows) {
            console.log(row.username);
        }
        return result.rows.map((u) => {
            return new User(u.user_id, u.username, u.password, u.firstName, u.lastName, u.email, u.role_name);
        });
    } catch (e) {
        throw new Error(`Failed to query for all users: ${e.message}`);
    } finally {
        client && client.release();
    }
}

export async function getUserById(id: number): Promise<User> {
    let client: PoolClient;
    client = await connectionPool.connect();
    try {
        let result: QueryResult;
        result = await client.query(`SELECT * FROM p0users;`);
        console.log(result);
        for (let row of result.rows) {
            console.log(row.username);
        }
        let newArray = result.rows.map((u) => {
            return new User(u.user_id, u.username, u.password, u.firstName, u.lastName, u.email, u.role);
        });
        return (newArray.filter((user) => {
            return (user.userId === id)
        }))[0];
    } catch (e) {
        throw new Error(`Failed to query for all users: ${e.message}`);
    } finally {
        client && client.release();
    }
}

export async function addNewUser(user: User): Promise<User> {
    let client: PoolClient = await connectionPool.connect();
    try {
        const roleIdResult: QueryResult = await client.query(`SELECT * FROM p0roles WHERE role_name = $1`, [user.role]);
        const roleId = roleIdResult.rows[0].id;
        let insertUserResult: QueryResult = await client.query(
            `INSERT INTO p0users (username, "password", email, role_id) VALUES
      ($1, $2, $3, $4);`, [user.username, user.password, user.email, roleId]
        )
        let result: QueryResult = await client.query(
            `SELECT p0users.user_id, p0users.username, p0users.password, p0users.email, p0roles.role_name
            FROM p0users INNER JOIN p0roles ON p0users.role = p0roles.role_id
            WHERE p0users.username = $1;`, [user.username]
        );

        return result.rows.map(
            (u) => { return new User(u.user_id, u.username, u.password, u.firstName, u.lastName, u.email, u.role_name) }
        )[0];
    } catch (e) {
        throw new Error(`Failed to add user to DB: ${e.message}`);
    } finally {
        client && client.release();
    }
}

export async function findUserByUsernamePassword(username: string, password: string): Promise<User> {
    let client: PoolClient;
    client = await connectionPool.connect();
    try {
        let result: QueryResult = await client.query(
            'SELECT * FROM p0users WHERE p0users.username = $1 AND p0users.password = $2;', [username, password]);
        const usersMatchingUsernamePassword = result.rows.map((u) => {
            return new User(u.user_id, u.username, u.password, u.firstName, u.lastName, u.email, u.role);
        })
        if (usersMatchingUsernamePassword.length > 0) {
            return usersMatchingUsernamePassword[0];
        } else {
            throw new Error('Username and Password not matched to a valid user');
        }
    } catch (e) {
        throw new Error(`Failed to validate User with DB: ${e.message}`);
    } finally {
        client && client.release();
    }
}

// export async function checkingCredentials(username: string, password: string) : Promise<User> {
//     let client : PoolClient;
//     client = await connectionPool.connect();
//     try {
//       let result : QueryResult = await client.query(
//         `SELECT *
//         FROM p0users 
//         WHERE p0users.username = $1 AND p0users.password = $2;`, [username, password]
//       );
//       const usersMatchingUsernamePassword = result.rows.map((u) => {
//         return new User(u.user_id, u.username, u.password, u.firstname, u.lastname, u.email, u.role_name);
//       })
//       if(usersMatchingUsernamePassword.length > 0) {
//         return usersMatchingUsernamePassword[0];
//       } else {
//         throw new Error('Username and Password not matched to a valid user');
//       }
//     } catch (e) {
//       throw new Error(`Failed to validate User with DB: ${e.message}`);
//     } finally {
//       client && client.release();
//     }
//   }
  

export async function updateUser(user_id: number, username?: string, password?: string, firstName?: string, lastName?: string, email?: string, role?: number): Promise<User[]> {
    let client: PoolClient = await connectionPool.connect();
    try {
        let query: string = ``;
        if (username) {
            query += `username = '${username}'`;
        }
        if (password) {
            query += `"password" = '${password}'`;
        }
        if (firstName) {
            query += `firstName = '${firstName}'`;
        }
        if (lastName) {
            query += `lastName = '${lastName}'`;
        }
        if (email) {
            query += `email = '${email}'`;
        }
        if (role) {
            query += `"role" = '${role}'`;
        }

        await client.query(`UPDATE p0users SET ${query} WHERE user_id = ${user_id};`);
        let result: QueryResult = await client.query(`SELECT * FROM p0users WHERE user_id = ${user_id};`);
        let userArray: User[] = result.rows.map((u) => {
            return new User(u.user_id, u.username, u.password, u.firstName, u.lastName, u.email, u.role_name);
        });
        return userArray;
    } catch (e) {
        throw new Error(`Failed to process update query: ${e.message}`);
    } finally {
        client && client.release();
    }
}