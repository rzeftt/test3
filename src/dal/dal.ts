import mysql from 'mysql2';
import { ResultSetHeader } from 'mysql2'; 
import { appConfig } from '../utils/appConfig';


const connection = mysql.createPool({
    user: appConfig.dbConfig.user,
    host: appConfig.dbConfig.host,
    port: appConfig.dbConfig.port,
    password: appConfig.dbConfig.password,
    database: appConfig.dbConfig.database
})



export default function runQuery(q: string, params?: any[]): Promise<ResultSetHeader> {
    return new Promise((resolve, reject) => {
        connection.query(q, params || [], (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res as ResultSetHeader);
        });
    });
}
