import winston from 'winston';
import { pool } from './dal';

const logger = winston.createLogger({
    level: 'error',
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

export async function runQuery(q: string, params: any[] = []): Promise<any> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(q, params);
        return rows;
    } catch (err) {
        logger.error('Database query failed', { query: q, params, error: err });
        throw err;  // שחרר את השגיאה כך שתוכל לטפל בה במקום אחר
    } finally {
        connection.release();
    }
}
