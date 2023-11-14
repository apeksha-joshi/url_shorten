import {findById} from '../dbServices/tierServices.js';

export const checkRequestLimit = async(req, res, next) =>{
    console.log("Inside check limit");
    try{
        const user = req.body.user;
        const tierId = user.tier;
        const userRequestCount = user.requestCount;
        const { maxRequests } = await findById(tierId);
        if(userRequestCount >=  maxRequests) {
            return res.status(429).json({error: "Request limit exceeded for the day"});
        }
        next();
    }catch(error) {
        return res.status(500).json({error: "Internal server error"});
    }
};