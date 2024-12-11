import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../services/jwtUtils';
import { getVacationById } from '../services/serverServices';

// Middleware to ensure user is an admin
export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authorization header missing or malformed');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
        console.log('Decoded token:', decoded);

        if (decoded.isAdmin === true) {
            console.log('User is admin, proceeding to next middleware');
            return next(); // אם המשתמש הוא מנהל, המשך
        } else {
            console.log('User is not an admin');
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
// Middleware to validate required fields
export async function fieldValidationIsRequired(req: Request, res: Response, next: NextFunction) {
    const { destination, description, start_date, end_date, price } = req.body;
    const vacationId = parseInt(req.params.id);

    try {
        const currentVacation = await getVacationById(vacationId);
        if (!currentVacation) {
            return res.status(404).json({ message: 'Vacation not found.' });
        }

        // Handle empty fields
        req.body = {
            destination: destination || currentVacation.destination,
            description: description || currentVacation.description,
            start_date: start_date || currentVacation.start_date,
            end_date: end_date || currentVacation.end_date,
            price: price !== undefined ? price : currentVacation.price,
        };
    } catch (error) {
        console.error('Error retrieving vacation:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    next();
}

// Middleware to validate price range
export function VerificationOfLeaveAmount(req: Request, res: Response, next: NextFunction) {
    const { price } = req.body;

    if (price < 0 || price > 10000) {
        return res.status(400).json({ message: 'Price must be between 0 and 10,000.' });
    }

    next();
}
// Middleware to validate dates
export function validateDates(req: Request, res: Response, next: NextFunction) {
    const { start_date, end_date } = req.body;

    const start = new Date(start_date);
    const end = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // הוספת זו לקביעת התאריך ל-0 שעות

    console.log('Start Date:', start);
    console.log('End Date:', end);
    console.log('Today:', today);

    // Check for valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Check that dates are not in the past
    if (start < today || end < today) {
        return res.status(400).json({ message: 'Dates cannot be in the past.' });
    }

    // Check that end date is not earlier than start date
    if (end < start) {
        return res.status(400).json({ message: 'End date cannot be earlier than start date.' });
    }

    next();
}
export const addNewVacations = async (req: Request, res: Response, next: NextFunction) => {
    const { destination, description, start_date, end_date, price } = req.body;
    const imageFile = req.file ? req.file.filename : null;

    // בדיקות לוודא שהנתונים הוזנו
    if (!destination || !description || !start_date || !end_date || !price) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // בדיקת מחירים
    const priceValue = parseFloat(price);  // המרת המחיר למספר
    if (isNaN(priceValue) || priceValue < 0 || priceValue > 10000) {
        return res.status(400).json({ message: "Price must be between 0 and 10,000." });
    }

    // המרת התאריכים לאובייקטי תאריך
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // בדיקת תאריך התחלה ותאריך סיום
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format." });
    }

    if (startDate > endDate) {
        return res.status(400).json({ message: "Start date cannot be later than end date." });
    }

    // בדיקה אם תאריך ההתחלה נמצא בעבר
    const currentDate = new Date();
    if (startDate < currentDate) {
        return res.status(400).json({ message: "Start date cannot be in the past." });
    }

    // בדיקה אם תאריך הסיום נמצא בעבר
    if (endDate < currentDate) {
        return res.status(400).json({ message: "End date cannot be in the past." });
    }

    // אם כל הבדיקות עברו בהצלחה, נמשיך לפונקציה הבאה
    next();
};

