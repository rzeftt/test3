import { Request, Response, NextFunction } from 'express';


// בדיקת אימייל תקין
export function isValidEmailLogin(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    next();
}

// בדיקת סיסמה באורך מינימלי
export function isValidPasswordLogin(req: Request, res: Response, next: NextFunction) {
    const { password } = req.body;

    if (password.length < 4) {
        return res.status(400).json({ message: 'Password must be at least 4 characters long.' });
    }

    next();
}

// בדיקת שדות חובה
export function validateRequiredFieldsLogin(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    next();
}
