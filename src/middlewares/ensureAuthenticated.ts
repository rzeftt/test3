import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


import { SECRET_KEY } from '../services/jwtUtils';



export interface AuthenticatedRequest extends Request {
    userId?: number;
}
export const ensureAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log('Running ensureAuthenticated middleware');

    // שליפת הטוקן מהכותרת Authorization
    const token = req.headers.authorization?.split(' ')[1];

    // אם אין טוקן, החזר שגיאת 401
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // אימות הטוקן
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: number; email: string; isAdmin: boolean; firstName: string; lastName: string };
        
        // אם הטוקן תקין, שמור את userId בבקשה להמשך השימוש
        req.userId = decoded.userId;
        console.log('Token is valid. User ID:', req.userId);

        // המשך לפעולה הבאה
        next();
    } catch (error) {
        // במקרה של טוקן לא תקין, החזר שגיאת 403
        console.error('Invalid token:', error);
        return res.status(403).json({ message: 'Invalid token' });
    }
};


