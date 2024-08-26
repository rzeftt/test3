import { trace } from 'console';
import express, { NextFunction, Request, Response } from 'express';
import { getAllParking, getAvailableParking, getOccupiedParking, getParkingByStreetName, updateParkingStatus} from '../services/parkingServices';
import catchAll from '../middlewares/catchAll';
export const parkingRouter = express.Router();


parkingRouter.get("/parking", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parkingList = await getAllParking(); // הפעל את הפונקציה
        res.status(200).json(parkingList);
        console.log('ok');
         // החזר את התוצאה
    } catch (error) {
       next(catchAll)
    }
});
parkingRouter.get("/parking/street/:streetName", async (req: Request, res: Response, next: NextFunction) => {
    const streetName = req.params.streetName; 
    console.log("Street name parameter:", streetName); // הדפס את שם הרחוב
    try {
        const parkingList = await getParkingByStreetName(streetName);
        res.status(200).json(parkingList); 
    } catch (error) {
        console.error("Error retrieving parking by street:", error);
        res.status(500).json({ message: "Error retrieving parking by street." });
    }
});

parkingRouter.put("/parking/:id", async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const { is_occupied } = req.body;

    if (isNaN(id) || typeof is_occupied !== 'boolean') {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const result = await updateParkingStatus(id, is_occupied);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Parking spot updated successfully' });
        } else {
            res.status(404).json({ error: 'Parking spot not found' });
        }
    } catch (error) {
        console.error("Error updating parking spot:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

parkingRouter.get('/parking/available', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const availableParkingSpots = await getAvailableParking();
        res.status(200).json(availableParkingSpots);
    } catch (error) {
        console.error('Error retrieving available parking:', error);
        res.status(500).json({ message: 'Error retrieving available parking.' });
    }
});

parkingRouter.get('/parking/occupied', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const occupiedParkingSpots = await getOccupiedParking();
        res.status(200).json(occupiedParkingSpots);
    } catch (error) {
        console.error('Error retrieving available parking:', error);
        res.status(500).json({ message: 'Error retrieving available parking.' });
    }
});