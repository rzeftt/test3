import { NextFunction, Request, Response } from "express";


function catchAll(err: any, req: Request, res: Response, next: NextFunction) {    
    console.log("DBG from catchAll: ", err);        
    res.status(500).send("Internal Server Error")
}

export default catchAll;