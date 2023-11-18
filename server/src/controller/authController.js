import { findUserByEmail, validateUserLogin, createUser, handleForgotPassword, updateResetPassword, UpdateUser } from '../dbServices/userServices.js'
import { getAuthToken, verifyResetToken } from '../middleware/auth.js';
import {findDefaultTier} from '../dbServices/tierServices.js';
import customError from '../config/ApiCallError.js';

import jwt from 'jsonwebtoken';
import {JWT_SECRET}  from '../utils/index.js';

const registerUser = async (req, res, next) => {
   
    try {
        
         // add additional validations for user input
        const payload = req.body;
        
        if (!payload.email || !payload.firstName || !payload.lastName || !payload.password) {
            //res.status(400).json({ message: "Missing required parameters" });
            next(new customError("Missing required parameters. Expected firstName, lastName, email, password, tier(optional)", 400, 'warn'));
        }
        else {
            console.log("Inside register", payload);
            let existingUser;
            try{
                existingUser = await findUserByEmail(payload.email);
            }catch(error){
                console.log("No user registered with this email");
            }
            
            if (existingUser) {
                //res.status(401).json({ message: "Email address not available" });
                next(new customError("Email address is already registered", 400, 'warn'));
            } else {
                try{
                    //payload.lastLoginDate = Date();
                    payload.lastLoginDate = new Date();
                    //payload.lastLoginDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
                    if(!payload.tier){
                        //set default tier for user
                        const defaultTier = await findDefaultTier();
                        if(!defaultTier){
                            //res.status(500).json({message: "Failed to find default Tier value"});
                            next(new customError("Failed to find default Tier value", 500, 'error'));
                        }
                        payload.tier = defaultTier;
                    }
                    const newUser = await createUser(payload);
                    req.body.user = newUser;
                    const tokens = await getAuthToken(req, res);
                    console.log(tokens);
                    
                    res.cookie('jwt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
                    res.status(200).json({ email: newUser.email, accessToken: tokens.accessToken });
                }catch(error){
                   // res.status(500).json({ message: "Internal server error" });
                    if(newUser){
                        await deleteUser(newUser._id);
                    }
                    next(new customError("Internal server error", 500, 'error'));
                }
                
            }
        }
    }
    catch (error) {
        //res.status(500).json({ message: "Internal server error" });
        next(new customError("Internal server error", 500, 'error'));
    }

}

const loginUser = async (req, res, next) => {
    try {
        const payload = req.body;
        // const updatedUser = req.body.user;

        if (!payload.email || !payload.password) {
            //res.status(400).json({ message: "Missing required parameters" });
            next(new customError("Missing required parameters. Expected email and password", 400, 'warn'));
        } else {
            const userData = await validateUserLogin(payload);
            if (userData === false) {
                //res.status(403).json({ message: "Invalid email/password" });
                next(new customError("Invalid email/password", 401, 'warn'));
            } else {
                //if (typeof userData === "object" && userData.email) {
                    const prevLastLoginDate = userData.lastLoginDate;
                    const currentDateTime = new Date();
                    const currDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
                    const lastLoginDate = new Date(userData.lastLoginDate.getFullYear(), userData.lastLoginDate.getMonth(), userData.lastLoginDate.getDate());
                    if (!userData.lastLoginDate || currDate.toDateString() !== lastLoginDate.toDateString()) {
                        userData.requestCount = 0;
                        userData.lastLoginDate = new Date();
                        await UpdateUser(userData);
                    }
                        
                        
                    try{
                        req.body.user = userData;
                        const tokens = await getAuthToken(req, res);
                        res.cookie('jwt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
                        res.status(200).json({ email: userData.email, accessToken: tokens.accessToken });
                    }catch(error){
                        userData.lastLoginDate = prevLastLoginDate;
                        await UpdateUser(userData);
                        next(new customError("Internal server error", 500, 'error'));
                    }
                    
                // } else {
                //     res.status(403).json({ message: "Invalid email/password" });
                // }
            }

        }
    } catch (error) {
        //console.log("in catch");
        //res.status(500);
        next(new customError("Internal server error", 500, 'error'));
    }
}

const handleRefreshToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            //res.status(400).send({ message: "Refresh token missing" });
            next(new customError("Refresh token missing", 400, 'warn'));
        } else {
            const refreshToken = cookies.jwt;
            console.log(refreshToken);
            // check if it is the correct token
            let refreshTokenDecoded;
            try{
                refreshTokenDecoded = jwt.verify(refreshToken, JWT_SECRET);
            }catch(error){
                return next(new customError("Invalid refresh token", 401, 'warn'))
            }
            
            // if (!refreshTokenDecoded) {
            //     return next(new customError("Invalid refresh token", 401, 'warn'))
            //     //res.status(401).send({ message: "Invalid refresh token" });
            // }

            // if decoded check agaisnt users refresh token
            const user = await findUserByEmail(refreshTokenDecoded.email);
            if (user.refreshToken !== refreshToken) {
                return next(new customError("Invalid refresh Token for the user", 401, 'warn'));
                //res.status(401).send({ message: "Invalid refresh Token for the user" });
            }
            req.body.user = user;
            // generate new tokens
            const tokens = await getAuthToken(req, res);
            res.cookie('jwt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
            res.status(200).json({ email: user.email, accessToken: tokens.accessToken });
        }
    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
};


const initiateForgotPassword = async(req, res, next) => {
    try{
    const email = req.body.email;
    if(!email){
        //res.status(400).json({message:"Missing required parameters"});
        next(new customError("Missing required parameters", 400, 'warn'));
    }else{  
            let existingUser;
            try{
                existingUser = await findUserByEmail(email);
            }catch(error){
                console.log("No user registered with this email");
            }
            
            if(!existingUser){
                //res.status(400).json({message:"Inavlid email"});
                next(new customError("Invalid email", 401, 'warn'));
            }else{
                const resetToken = await handleForgotPassword(email);
                if (resetToken) {
                    // send reset link as well via email
                    res.status(200).json({ resetToken: resetToken });
                  } else {
                    //res.status(500).json({message:"Failed to reset refreshToken due to internal error"});
                    next(new customError("Failed to reset refreshToken due to internal error", 500, 'error'));
                  }
            }
        
    }
}catch(error){
    next(new customError("Internal server error", 500, 'error'));
}
}


const resetPassword = async(req, res, next) =>{
    try{
    const {resetToken, password} = req.body;
    if(!resetToken || !password) {
        //res.status(400).json({message:"Missing required parameters"});
        next(new customError("Missing required parameters",400, 'warn'));
    }
    else{
            const email = await verifyResetToken(resetToken);
            
            if(email && typeof email === 'string'){
                const isReset = await updateResetPassword(password, email);
                
                if(isReset){
                    res.status(200).json({message:"Reset successful"});
                }else{
                    //res.status(400).json({message:"Reset failed"});
                    next(new customError("Failed to reset password due to internal error",500, 'error'));
                }
                
            }else{
                next(new customError("Invalid ResetToken",401, 'warn'));
                //res.status(400).json({message:"Invalid ResetToken"});
            }
    }
}catch(error){
    next(new customError("Internal server error",500, 'error'));
}
}

const handleLogout = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.status(200).send({ message: "User was successfully logged out" });
        }
        const refreshToken = cookies.jwt;
        // check if it is the correct token

        const refreshTokenDecoded = jwt.verify(refreshToken, JWT_SECRET);
        if (!refreshTokenDecoded) {
            //return res.status(401).send({message: "Invalid refresh token"});
            return next(new customError("Invalid refresh token", 401, 'warn'));
        }

        // if decoded check agaisnt users refresh token
        const user = await findUserByEmail(refreshTokenDecoded.email);
        if (user.refreshToken !== refreshToken) {
            //return res.status(403).send({message: "Invalid refresh Token for the user"});
            return next(new customError("Invalid refresh Token", 403, 'warn'));
        }

        // remove refreshToken from user
        user.refreshToken = '';
        await UpdateUser(user);

        // clear cookie
        res.clearCookie('jwt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        res.status(200).json({ message: "User was successfully logged out" });

    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
}

export default {
    registerUser,
    loginUser,
    initiateForgotPassword,
    resetPassword,
    handleRefreshToken,
    handleLogout,
};