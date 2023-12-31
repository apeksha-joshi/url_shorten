import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import  {promises as fsPromises } from "fs";
import path from "path";
import {fileURLToPath} from "url";
import customError from '../config/ApiCallError.js';


const requestLogFileName = "requestLog.txt";
const errorLogFileName = "errorLog.txt";

export const logEvents = async (message, filename) => {
    const dateTimestamp = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTimestamp}\t${uuid()}\t${message}\n`;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    try{
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', filename), logItem);
    }catch(error){
        console.log(error);
    }
};


export const logger = (req, res, next) => {
    let envLogFileName;
    if(process.env.NODE_ENV === 'test'){
        envLogFileName = testRequestLogFileName;
    }else{
        envLogFileName = requestLogFileName;
    }
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, envLogFileName);
    console.log(`Route call : ${req.method}: ${req.originalUrl}`);
    next();
};

export const errorLogger = (err, req, res, next) => {
    let envErrorLogFileName;
    if(process.env.NODE_ENV === 'test'){
        envErrorLogFileName = testErrorLogFileName;
    }else{
        envErrorLogFileName = errorLogFileName;
    }
    logEvents(`${err.status} : ${err.logLevel} : ${err.message}`, envErrorLogFileName);
    if(err instanceof customError) {
        res.status(err.status).json(err.toResponseJSON());
    }else{
        res.status(500).json({message: "Internal server error"});
    }
    
    
};
