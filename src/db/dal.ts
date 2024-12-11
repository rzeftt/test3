import mysql from 'mysql2/promise';
import { appConfig } from '../utils/appConfig';
import winston from 'winston';

// יצירת בריכת חיבורים עם הגדרות נוספות
export const pool = mysql.createPool({
    user: appConfig.dbConfig.user,
    host: appConfig.dbConfig.host,
    port: appConfig.dbConfig.port,
    password: appConfig.dbConfig.password,
    database: appConfig.dbConfig.database,
    waitForConnections: true,  // מחכה לחיבור פנוי במקום לדחות חיבורים
    connectionLimit: 10,       // מספר מקסימלי של חיבורים בבריכה
    queueLimit: 0              // מספר בלתי מוגבל של בקשות בתור (או להגדיר גבול אם יש צורך)
});

// הגדרת יומן שגיאות
const logger = winston.createLogger({
    level: 'error',
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

// פונקציה לביצוע השאילתה
export async function runQuery(q: string, params: any[] = []): Promise<any> {
    const connection = await pool.getConnection();
    try {
        // ביצוע השאילתה
        const [rows] = await connection.query(q, params);

        // אם השאילתה היא SELECT, מחזירים את כל השורות
        if (q.trim().startsWith('SELECT')) {
            return rows;
        }
        
        if (q.trim().startsWith('INSERT')) {
            // במקרה של INSERT, ה-ResultSetHeader מחזיר מידע על ההכנסה, כולל ה- insertId
            return { insertId: (rows as mysql.ResultSetHeader).insertId };
        }
        
        // עבור שאילתות אחרות, מחזירים את התוצאות (לדוג' UPDATE, DELETE)
        return rows;
        
    } catch (err) {
        // רישום שגיאות ביומן
        logger.error('Database query failed', { query: q, params, error: err });

        // שחרור השגיאה כדי לטפל בה במקום אחר
        throw err;
    } finally {
        // שחרור החיבור מהבריכה
        connection.release();
    }
}
