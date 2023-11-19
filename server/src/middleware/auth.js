import jwt from 'jsonwebtoken';
//import {JWT_SECRET}  from '../utils/index.js';
import User from '../models/userModel.js';
import {UpdateUser,findUserByEmail} from '../dbServices/userServices.js';
import customError from '../config/ApiCallError.js';

export const generateAccessToken = (user) => {
    
    //console.log("Inside generate access", process.env.JWT_SECRET);
    return jwt.sign(
        {
            email: user.email,
            isLoggedIn: true,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '15h',
        }
    );
};


export const generateResetToken = (user) =>{
    return jwt.sign(
        {
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "24h",
        }
    );
};

export const generateRefreshToken = async (user) => {
    try {
        const token = jwt.sign(
            {
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d',
            }
        );
        user.refreshToken = token;
        await UpdateUser(user);
        return token;
    } catch (error) {
        throw new customError("Internal error - failed to generate refresh token", 500, 'error');
    }
}; 

export const verifyResetToken = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token, process.env.JWT_SECRET,
            async (err, decoded) => {
                if(err){
                    resolve(false);
                }else{
                    try{
                        resolve(decoded.email);
                    }catch(error){
                        resolve(false);
                    }
                }
            }
        );
    });
};

export const getAuthToken =async(req, res)=> {
    const user = req.body.user;
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    return {refreshToken, accessToken};
    
};

export const verifyToken = async(req,res,next) => {
    
    const authHeader = req.headers.authorization || req.headers.Authorization;
    //?.replace('Bearer ', '') || '';
    if(!authHeader?.startsWith('Bearer ')){
        return next(new customError("Access Token not provided", 400, 'warn'));
        //return res.status(401).json({message: 'No token provided'});
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });


        if (decoded) {
            const user = await User.findOne({ email: decoded.email });
            req.body.user = user;
            next();
        }
    } catch (error) {
        console.error('Token verification error:', error);

        if (error.name === 'TokenExpiredError') {
            return next(new customError("Token has expired", 403, 'warn'));
            //return res.status(401).send({ message: 'Token has expired' });
        } else {
            return next(new customError("Invalid Token", 401, 'warn'));
            //return res.status(401).send({ message: 'Invalid Token' });
        }
    }
   
};




