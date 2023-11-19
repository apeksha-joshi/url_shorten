// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import fs from "fs";
import {fileURLToPath} from "url";
import dbConnect  from './config/dbConn.js';
import baseRouter from './routes/index.js';
import corsOptions from './config/corsOptions.js';
import {logger, errorLogger} from './middleware/eventLogger.js';
import customError from './config/ApiCallError.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// //console.log(path.resolve(__dirname, '..',`.env.${process.env.NODE_ENV}`));
// console.log(path.resolve(`../server/.env.${process.env.NODE_ENV}`));
// const envFilePath = path.resolve(__dirname, '..',`.env.${process.env.NODE_ENV}`);
// const envFileContent = fs.readFileSync(envFilePath, 'utf8');
// console.log(dotenv.parse(envFileContent));

dotenv.config({
  path: path.resolve(`../server/.env.${process.env.NODE_ENV}`)
});

const app = express();


if(process.env.NODE_ENV === 'development'){
  console.log("Inside Dev DB ");
  //Connect db
  dbConnect();
  // initialize data?
}



//logger
app.use(logger);

//print all the route calling - remove later
// app.use((req, res, next) => {
//     console.log(`Route call : ${req.method}: ${req.originalUrl}`); // req.path check move to middleware? logs file
//     next();
// });

// set cors options
app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use('/api', baseRouter);


// handle undefined routes
app.all('*', (req, res, next) => {
    // res.status(404);
    // res.json({ "error": "404 Route Not Found" });
    next(new customError("404 Route Not Found", 404, 'warn'))
});


//error logger
app.use(errorLogger);

let server;



const PORT = process.env.PORT || 5001;

//intialize the app
mongoose.connection.once('open', () => {
      server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  });
  


//listen unhandleRejection and uncaughtException
process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at:", p, "reason:", reason);
    //app.close();
    //process.exit(1);
    server.close(()=>process.exit(1));
  });

process.on("uncaughtException", (e) => {
    console.error("Uncaught exception at:", e);
    server.close(()=>process.exit(1));
    // app.close();
    // process.exit(1);
  });

// Handle SIGINT signal for graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing server gracefully.');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});
// process.on("SIGTERM", () => {
//     console.log("SIGTERM received. Shutting down gracefully");
//     app.close(() => {
//       console.log("Closed out remaining connections");
//       process.exit(0);
//     });
//   });


// app.listen(PORT, ()=>{
//     console.log(`Server is running on port ${PORT}`);
// });
export default app;