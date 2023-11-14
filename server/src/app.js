// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbConnect  from './config/db.js';
import baseRouter from './routes/index.js';


dotenv.config();

const app = express();
app.use(express.json());


app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5001;


//intialize the app
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});

//start db connection
dbConnect();


//print all the route calling
app.use((req, res, next) => {
    console.log(`Route call : ${req.method}: ${req.originalUrl}`); // req.path check move to middleware? logs file
    next();
});


app.use('/api', baseRouter);


//listen unhandleRejection
process.on("unhandledRejection", (reason, p) => {
    console.error("Unhandled Rejection at:", p, "reason:", reason);
    app.close();
    process.exit(1);
  });
  
process.on("uncaughtException", (e) => {
    console.error("Uncaught exception at:", e);
    app.close();
    process.exit(1);
  });