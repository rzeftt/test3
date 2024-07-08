import express, { Request, Response } from "express"

const server = express();

// load body
server.use(express.json());

server.get("/", (req: Request, res: Response)=>{
    res.send("<h1>Hello World!</h1>")
})

server.listen(3000, ()=>{console.log("Listening on http://localhost:3000");
})
