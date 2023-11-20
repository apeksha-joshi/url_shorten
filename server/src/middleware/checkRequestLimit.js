import {findById} from '../dbServices/tierServices.js';
import customError from '../config/ApiCallError.js';

export const checkRequestLimit = async(req, res, next) =>{
    
    try{
        const user = req.body.user;
        const tierId = user.tier;
        const userRequestCount = user.requestCount;
        const { maxRequests } = await findById(tierId);
        if(userRequestCount >=  maxRequests) {
            next(new customError("Request limit exceeded for the day", 429, 'warn'));
        }
        next();
    }catch(error) {
        next(new customError("Internal server error", 500, 'error'));
    }
};