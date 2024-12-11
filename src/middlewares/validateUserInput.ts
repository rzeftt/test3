import { Request, Response, NextFunction } from 'express';
import { runQuery } from '../db/dal'; // ייבוא נכון של runQuery



// פונקציה לבדוק אם כתובת המייל קיימת כבר

export async function isEmailTaken(email: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM users WHERE email = ?;';
    const result = await runQuery(query, [email]);
    return result[0]?.count > 0;
}

// פונקציה לאימות כתובת מייל
export async function isValidEmail(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // בדוק אם האימייל כבר קיים
    const emailTaken = await isEmailTaken(email);
    if (emailTaken) {
        return res.status(400).json({ message: 'Email is already taken.' });
    }

    next();
}


export async function isValidPassword(req: Request, res: Response, next: NextFunction) {
    const { password } = req.body;

    if (password.length < 4) {
        return res.status(400).json({ message: 'Password must be at least 4 characters long.' });
    }

    next();
}


export function validateRequiredFields(req: Request, res: Response, next: NextFunction) {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'All fields (except admin) are required.' });
    }

    next();
}
