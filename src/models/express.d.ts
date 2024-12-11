// src/express.d.ts או src/types/express.d.ts
declare namespace Express {
    export interface Request {
        userId?: number; // או אם אתה רוצה שיהיה תמיד קיים, אפשר להגדיר את זה כ-required (userId: number;)
    }
}
