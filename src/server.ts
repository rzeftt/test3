import express from 'express';
import { appConfig } from './utils/appConfig';
import { vacationsRouter } from './controllers/serverControler';
import catchAll from './middlewares/catchAll';
import path from 'path';
import  cors from 'cors';


const server = express();

// Middleware
server.use(cors());
server.use(express.json());

// Static Assets
server.use('/assets', express.static(path.join(__dirname, './assets/images')));

// Routers
server.use('/', vacationsRouter);

// Error Handling Middleware
server.use(catchAll);

// Start Server
try {
    server.listen(appConfig.port, () => {
        console.log(`Listening on http://localhost:${appConfig.port}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
}
export default server;