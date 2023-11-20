import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';

import dbConnect from './config/dbConn.js';
import baseRouter from './routes/index.js';
import corsOptions from './config/corsOptions.js';
import { logger, errorLogger } from './middleware/eventLogger.js';
import customError from './config/ApiCallError.js';


process.env.NODE_ENV = process.env.NODE_ENV || 'development';


if (process.env.NODE_ENV === 'production') {
    dotenv.config();
} else {
  dotenv.config({
    path: path.resolve(`../server/.env.${process.env.NODE_ENV}`)
  });
}


const app = express();


if (process.env.NODE_ENV !== 'test') {
  //Connect db
  dbConnect();
}

//logger
app.use(logger);


// set cors options
app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use('/api', baseRouter);


// handle undefined routes
app.all('*', (req, res, next) => {
  next(new customError("404 Route Not Found", 404, 'warn'))
});



if (process.env.NODE_ENV !== 'test') {
  //error logger
  app.use(errorLogger);
}

let server;

const PORT = process.env.PORT || 5001;

//intialize the app
mongoose.connection.once('open', () => {
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
});


//listen unhandleRejection and uncaughtException
process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (e) => {
  console.error("Uncaught exception at:", e);
  server.close(() => process.exit(1));
});

// Handle SIGINT signal for graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing server gracefully.');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});

export default app;