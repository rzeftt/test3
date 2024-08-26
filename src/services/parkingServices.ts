import { ResultSetHeader } from 'mysql2/promise'; // ייבוא של ResultSetHeader

import runQuery from '../dal/dal';
import { Request, Response } from 'express';


export async function getAllParking() {
    const q = `
        SELECT parking.*, street.name AS street_name
        FROM parking
        JOIN street ON parking.street_id = street.id;
    `;
    return await runQuery(q);
}
 export async function getParkingByStreetName(streetName) {
    const q = `
        SELECT parking.*, street.name AS street_name
        FROM parking
        JOIN street ON parking.street_id = street.id
        WHERE street.name = ?;
    `;

    // בדוק אם streetName הוא מחרוזת ולא מערך
    if (typeof streetName !== 'string') {
        console.error("Error: streetName should be a string.");
        return; // או לזרוק שגיאה
    }

    try {
        const result = await runQuery(q, [streetName]); // כאן זה עובד עכשיו
        return result;
    } catch (error) {
        console.error("Error executing query:", error);
    }
}


// פונקציה לעדכון מצב החניה
export async function updateParkingStatus(id: number, isOccupied: boolean) {
    const q = `
        UPDATE parking
        SET is_occupied = ${isOccupied}
        WHERE id = ${id};
    `;

    try {
        const result: ResultSetHeader = await runQuery(q, [isOccupied, id]);
        return result;
    } catch (error) {
        console.error("Error executing update query:", error);
        throw error; // לזרוק את השגיאה כדי שהמיקום שמזמין את הפונקציה ידע לטפל בה
    }
}

export async function getAvailableParking() {
    const q = `
        SELECT parking.*, street.name AS street_name
        FROM parking
        JOIN street ON parking.street_id = street.id
        WHERE parking.is_occupied = FALSE;
    `;
    return await runQuery(q);
}

export async function getOccupiedParking() {
    const q = `
        SELECT parking.*, street.name AS street_name
        FROM parking
        JOIN street ON parking.street_id = street.id
        WHERE parking.is_occupied = TRUE;
    `;
    return await runQuery(q);
}