import {UpdateUser} from '../dbServices/userServices.js';
import customError from '../config/ApiCallError.js';

export const manageUserRequestLimit = async (req, res, next) => {
    try{
        const user = req.body.user;
        const currentDateTime = new Date();
        const currDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
        const lastLoginDate = new Date(user.lastLoginDate.getFullYear(), user.lastLoginDate.getMonth(), user.lastLoginDate.getDate());
        if(!user.lastLoginDate || currDate.toDateString() !== lastLoginDate.toDateString()){
            req.body.user.requestCount = 0;
            req.body.user.lastLoginDate = new Date();
            
        }
        next();
    }catch(error) {
        next(new customError("Internal server error - Failed while checking limit", 500, 'error'));
        //return res.status(500).json({error: "Internal server error"});
    }
};