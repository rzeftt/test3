
import bcrypt from 'bcrypt';
import {  VacationWithFollowers } from '../models/vacationsModel';
import { UserPayload } from '../models/userModel';
import mysql from 'mysql2';
import { appConfig } from '../utils/appConfig'; // עדכן את הנתיב לקובץ הקונפיגורציה שלך
import { runQuery } from '../db/dal';
import { generateToken } from './jwtUtils';
import { isEmailTaken } from '../middlewares/validateUserInput';


// פונקציה לרישום משתמש
export async function registerUser(
    first_name: string, 
    last_name: string, 
    email: string, 
    password: string, 
    is_admin: boolean
): Promise<{ token: string, userId: number }> {
    try {
        // הצפנה של הסיסמה
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // בדיקה אם כתובת המייל כבר קיימת
        const emailTaken = await isEmailTaken(email);
        if (emailTaken) {
            throw new Error('Email is already taken.');
        }

        // הכנת השאילתה
        const q = `INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES (?, ?, ?, ?, ?);`;
        const params = [first_name, last_name, email, hashedPassword, is_admin];
        const result = await runQuery(q, params);

        // יצירת הטוקן
        const userId = result.insertId;  // ה- user_id של המשתמש שנוצר
        const token = generateToken(userId, email, is_admin, first_name, last_name);

        return { token, userId };
    } catch (error) {
        console.error("Error during user registration:", error);
        throw error;  // זרוק את השגיאה חזרה במקרה של בעיה
    }
}

export async function addUser(first_name: string, last_name: string, email: string, password: string, is_admin: boolean): Promise<number> {
    // קוראים לפונקציה registerUser ומחזירים רק את ה-userId
    const { userId } = await registerUser(first_name, last_name, email, password, is_admin);
    return userId;
}
export async function loginUser(email: string, password: string): Promise<UserPayload | null> {
    try {
        // שאילתת בדיקת אימייל
        const checkEmailQuery = `
            SELECT 
                user_id, email, is_admin, password, first_name, last_name, token 
            FROM users 
            WHERE email = ?
        `;
        const params = [email];

        // ביצוע השאילתה
        const result = await runQuery(checkEmailQuery, params);

        // דיבאג: הדפסת תוצאות השאילתה
        console.log('Query result:', result);

        // בדיקה אם המשתמש קיים
        if (!Array.isArray(result) || result.length === 0) {
            console.log('User not found');
            return null;
        }

        const user = result[0];

        // דיבאג: הצגת פרטי המשתמש
        console.log('User found:', user);

        // בדיקת סיסמה באמצעות bcrypt
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log('Password correct:', isPasswordCorrect);

        if (!isPasswordCorrect) {
            console.log('Incorrect password');
            return null;
        }

        // יצירת האובייקט להחזרה
        const payload: UserPayload = {
            id: user.user_id,
            email: user.email,
            isAdmin: !!user.is_admin, // וודא שהשדה הוא בוליאני
            firstName: user.first_name,
            lastName: user.last_name,
            token: user.token,
        };

        // דיבאג: הצגת המטען להחזרה
        console.log('Returning payload:', payload);

        return payload;
    } catch (error) {
        // טיפול בשגיאות
        console.error('Error in loginUser:', error);
        return null;
    }
}
export const getAllVacations = async (userId: number) => {
    const q = `
        SELECT vacations.*, 
               (CASE WHEN followers.user_id IS NOT NULL THEN 1 ELSE 0 END) AS isFollowing,
               (SELECT COUNT(*) FROM followers WHERE followers.vacation_id = vacations.vacation_id) AS followers_count
        FROM vacations
        LEFT JOIN followers ON vacations.vacation_id = followers.vacation_id AND followers.user_id = ?
        ORDER BY vacations.start_date ASC;
    `;

    const result = await runQuery(q, [userId]);
    console.log('Vacations data retrieved:', result);
    return result;
};


export async function addNewVacation(destination: string, description: string, start_date: string, end_date: string, price: number, image_file_name?: string) {
    // ודא שכל השדות החובה הוזנו
    if (!destination || !description || !start_date || !end_date || !price) {
        throw new Error('All fields are required');
    }

    const q = `
        INSERT INTO vacations (destination, description, start_date, end_date, price, image_file_name) 
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    const params = [destination, description, start_date, end_date, price, image_file_name || null];

   
        await runQuery(q, params);
        console.log('Vacation is added');
    
}

export async function editVacation(
    vacation_id: number,
    destination: string,
    description: string,
    start_date: string,
    end_date: string,
    price: number,
    image_file_name: string
): Promise<void> {
    const query = `
        UPDATE vacations
        SET destination = ?, description = ?, start_date = ?, end_date = ?, price = ?, image_file_name = ?
        WHERE vacation_id = ?
    `;
    const params = [destination, description, start_date, end_date, price, image_file_name, vacation_id];

    try {
        console.log('Running query:', query, params); // הדפסת השאילתא למעקב
        const result = await runQuery(query, params);
        if (result.affectedRows === 0) {
            throw new Error('החופשה לא נמצאה או לא בוצע שינוי.');
        }
    } catch (error) {
        console.error('שגיאה בעדכון החופשה במסד הנתונים:', error);
        throw error;
    }
}

// src/services/vacationService.ts
export async function getVacationById(vacationId: number) {
    try {
        console.log(`Fetching vacation with ID: ${vacationId}`); // לוג לפני השאילתה
        const rows = await runQuery('SELECT * FROM vacations WHERE vacation_id = ?', [vacationId]);
        
        if (rows.length === 0) {
            console.error(`Vacation with ID ${vacationId} not found`);
            throw new Error(`Vacation with ID ${vacationId} not found`);
        }
        
        console.log(`Vacation found: ${JSON.stringify(rows[0])}`); // לוג אחרי השאילתה
        return rows[0];
    } catch (error) {
        console.error(`Error fetching vacation with ID ${vacationId}:`, error);
        throw error; 
    }
}

export const followVacation = async (userId: number, vacationId: number) => {
    const q = `
        INSERT INTO followers (user_id, vacation_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), vacation_id = VALUES(vacation_id);
    `;

    await runQuery(q, [userId, vacationId]);
};
export const unfollowVacation = async (userId: number, vacationId: number) => {
    const q = `
        DELETE FROM followers 
        WHERE user_id = ? AND vacation_id = ?;
    `;
    console.log('Running query:', q, [userId, vacationId]); // לוג לשאילתא
    try {
        await runQuery(q, [userId, vacationId]);
        console.log('Successfully unfollowed vacation');
    } catch (error) {
        console.error('Error in query:', error);
    }
};


export const getFollowedVacations = async (userId: number) => {
    const q = `
        SELECT vacations.*, 
               1 AS isFollowing,  -- תמיד 1 כי אנו מביאים רק חופשות שהמשתמש עוקב אחריהן
               (SELECT COUNT(*) FROM followers WHERE followers.vacation_id = vacations.vacation_id) AS followers_count
        FROM vacations
        INNER JOIN followers ON vacations.vacation_id = followers.vacation_id
        WHERE followers.user_id = ?
        ORDER BY vacations.start_date ASC;
    `;

    const result = await runQuery(q, [userId]);
    console.log('Followed vacations retrieved:', result);
    return result;
};

export const deleteVacation = async (vacationId: string) => {
    // מחיקת כל הרשומות בטבלת followers שקשורות לחופשה זו
    const q = `DELETE FROM followers WHERE vacation_id = ?`;
    await runQuery(q, [vacationId]);

    // מחיקת החופשה עצמה
    const deleteVacationQuery = `DELETE FROM vacations WHERE vacation_id = ?`;
    await runQuery(deleteVacationQuery, [vacationId]);
};

export async function getVacationReport() {
    try {
        const q = `
            SELECT v.destination, COALESCE(COUNT(f.user_id), 0) AS followers_count
            FROM vacations v
            LEFT JOIN followers f ON v.vacation_id = f.vacation_id
            GROUP BY v.vacation_id;
        `;
        
        const result = await runQuery(q);
        console.log('Vacation Report Data:', result);  // Log the data for debugging
        return result; // Return the data in the expected format
    } catch (error) {
        console.error('Error fetching vacation report:', error);
        throw error;
    }
}
