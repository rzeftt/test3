import express, { Request, Response, NextFunction } from 'express';
import { addNewVacation, addUser, deleteVacation, editVacation, followVacation, getAllVacations, getFollowedVacations, getVacationById, getVacationReport, loginUser, registerUser, unfollowVacation } from '../services/serverServices';
import { isEmailTaken, isValidEmail, isValidPassword, validateRequiredFields } from '../middlewares/validateUserInput';
import { addNewVacations, ensureAdmin, fieldValidationIsRequired, validateDates, VerificationOfLeaveAmount } from '../middlewares/validateAdd_EditVacation ';
import { AuthenticatedRequest, ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import multer from 'multer';
import path from 'path';
import { generateToken, saveTokenToDatabase } from '../services/jwtUtils';
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'; // ייבוא fs
import { runQuery } from '../db/dal';

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'assets', 'images'); // תיקיית יעד מחוץ ל-src
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // יצירת התיקיה אם לא קיימת
        }
        cb(null, uploadPath); // תיקיית יעד
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const fileExtension = path.extname(file.originalname);
        const uniqueFileName = `${uniqueSuffix}${fileExtension}`;
        cb(null, uniqueFileName); // שם קובץ ייחודי
    },
});

const upload = multer({ storage });


interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

export const vacationsRouter = express.Router();
vacationsRouter.post('/register', validateRequiredFields, isValidEmail, isValidPassword, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { first_name, last_name, email, password, is_admin } = req.body;
        
        // רישום משתמש חדש
        const { token, userId } = await registerUser(first_name, last_name, email, password, is_admin || false);

        // שמירת הטוקן בטבלת המשתמשים
        await saveTokenToDatabase(userId, token);

        res.status(201).json({ message: 'User registered successfully.', token, userId });
        console.log('User registered and token created.');
    } catch (error) {
        next(error);
    }
});

vacationsRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await loginUser(email, password);

        if (user) {
            const token = generateToken(user.id, user.email, user.isAdmin, user.firstName, user.lastName);

            res.status(200).json({
                message: 'Login successful',
                token,
                userId: user.id,
                isAdmin: user.isAdmin,
                firstName: user.firstName,
                lastName: user.lastName,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        next(error);
    }
});

vacationsRouter.post('/addVacation', ensureAdmin, upload.single('image'), async (req: RequestWithFile, res: Response) => {
    const { destination, description, start_date, end_date, price } = req.body;

    console.log("Received data:", req.body); // הדפסת הנתונים המתקבלים

    if (!destination || !description || !start_date || !end_date || !price) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const image_file_name = req.file ? req.file.filename : null;

    try {
        await addNewVacation(destination, description, start_date, end_date, price, image_file_name ?? undefined);
        res.status(201).json({ message: 'Vacation added successfully' });
    } catch (error) {
        console.error('Error adding vacation:', error);
        res.status(500).json({ message: 'Error adding vacation' });
    }
});

vacationsRouter.put('/editVacations/:id', ensureAdmin, upload.single('image_file'), async (req: RequestWithFile, res: Response) => {
    try {
        const vacationId = parseInt(req.params.id);
        const { destination, description, start_date, end_date, price, image_file_name } = req.body;

        console.log('קובץ שהועלה:', req.file); // הדפסת הקובץ שהועלה
        console.log('גוף הבקשה:', req.body); // הדפסת גוף הבקשה

        if (!destination || !description || !start_date || !end_date || !price) {
            return res.status(400).json({ message: 'כל השדות חייבים להיות מלאים' });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ message: 'תאריכים לא תקינים' });
        }

        if (startDate > endDate) {
            return res.status(400).json({ message: 'תאריך הסיום לא יכול להיות לפני תאריך התחלה' });
        }

        const startDateFormatted = startDate.toISOString().split('T')[0];
        const endDateFormatted = endDate.toISOString().split('T')[0];

        // קביעת שם התמונה (חדש או קיים)
        const imageFileName = req.file ? req.file.filename : image_file_name;

        if (!imageFileName) {
            return res.status(400).json({ message: 'נדרשת תמונה חדשה או URL של תמונה קיימת.' });
        }

        // קריאה לפונקציה שמעדכנת את החופשה במסד הנתונים
        await editVacation(
            vacationId,
            destination,
            description,
            startDateFormatted,
            endDateFormatted,
            parseFloat(price),
            imageFileName
        );

        res.status(200).json({ message: 'החופשה עודכנה בהצלחה!' });
    } catch (error) {
        console.error('שגיאה בעדכון החופשה:', error);
        res.status(500).json({ message: 'שגיאה בעדכון החופשה' });
    }
});

vacationsRouter.get('/vacations', ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    try {
        const vacations = await getAllVacations(userId ?? 0);  

        res.status(200).json(vacations);
    } catch (error) {
        console.error('Failed to retrieve vacations data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

vacationsRouter.get('/vacations/:id', ensureAuthenticated, async (req: RequestWithFile, res: Response) => {
    try {
        const vacationId = parseInt(req.params.id, 10);

        if (isNaN(vacationId)) {
            return res.status(400).json({ message: 'Invalid vacation ID' });
        }

        console.log(`Fetching vacation with ID: ${vacationId}`);

        const vacation = await getVacationById(vacationId);
        if (!vacation) {
            return res.status(404).json({ message: 'Vacation not found' });
        }

        return res.status(200).json(vacation);
    } catch (error) {
        console.error('Error in get vacation route:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

vacationsRouter.post('/vacations/follow', ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { vacationId } = req.body;

    if (!userId || !vacationId) {
        return res.status(400).json({ error: 'Missing userId or vacationId' });
    }

    const query = `
        INSERT INTO followers (user_id, vacation_id)
        VALUES (?, ?)
    `;
    try {
        await runQuery(query, [userId, vacationId]);
        res.status(200).json({ message: 'Successfully followed vacation' });
    } catch (error) {
        console.error('Failed to follow vacation:', error);
        res.status(500).json({ error: 'Failed to follow vacation' });
    }
});

vacationsRouter.get('/vacations/followed', ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    try {
        const followedVacations = await getFollowedVacations(userId ?? 0);

        res.status(200).json(followedVacations);
    } catch (error) {
        console.error('Failed to retrieve followed vacations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

vacationsRouter.post('/vacations/unfollow', ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId; // הוצאת userId מה-token
    const { vacationId } = req.body;

    console.log('Received userId:', userId); // הדפסת ה-userId
    console.log('Received vacationId:', vacationId); // הדפסת ה-vacationId

    if (!userId || !vacationId) {
        return res.status(400).json({ error: 'Missing userId or vacationId' });
    }

    try {
        await unfollowVacation(userId, vacationId); // קריאה לפונקציה שמסירה את המעקב
        res.status(200).json({ message: 'Successfully unfollowed vacation' });
    } catch (error) {
        console.error('Failed to unfollow vacation:', error);
        res.status(500).json({ error: 'Failed to unfollow vacation' });
    }
});

vacationsRouter.delete('/vacation/delete/:id', ensureAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vacationId = req.params.id;
        
        // בדיקה האם ה-ID קיים לפני מחיקה
        const result = await runQuery(`SELECT * FROM vacations WHERE vacation_id = ?`, [vacationId]);
        if (result.length === 0) {
            return res.status(404).json({ message: "Vacation not found" });
        }

        await deleteVacation(vacationId);
        res.status(200).send("The vacation has been successfully deleted");
    } catch (error) {
        console.error("Error deleting vacation:", error);
        res.status(500).send("Problem deleting vacation");
    }
});

vacationsRouter.get('/vacations-report', ensureAdmin, async (req: Request, res: Response) => {
    try {
        const reportData = await getVacationReport();  // Get the vacation report data
        res.json(reportData);  // Send the data back to the frontend as JSON
    } catch (error) {
        console.error('Error fetching vacation report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
