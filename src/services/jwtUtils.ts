
import jwt from 'jsonwebtoken';
import { runQuery } from '../db/dal';

export const SECRET_KEY = 'yourSecretKey';  // ייצוא המפתח הסודי
export function generateToken(userId: number, email: string, isAdmin: boolean, firstName: string, lastName: string): string {
    if (!SECRET_KEY) {
        throw new Error('SECRET_KEY is not defined. Please set it in your environment variables.');
    }

    const payload = { userId, email, isAdmin, firstName, lastName };
    console.log('Generated token payload:', payload);
    

    try {
        // יצירת הטוקן עם תוקף של 7 ימים
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Failed to generate token');
    }
}
export async function saveTokenToDatabase(userId: number, token: string): Promise<void> {
    const q = `UPDATE users SET token = ? WHERE user_id = ?`;
    await runQuery(q, [token, userId]);
    console.log('Token saved successfully for user ID:', userId);
}


