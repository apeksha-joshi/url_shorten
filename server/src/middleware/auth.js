import jwt from 'jsonwebtoken';
import {JWT_SECRET}  from '../utils/index.js';
import User from '../models/userModel.js';
import {UpdateUser,findUserByEmail} from '../dbServices/userServices.js';

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            isLoggedIn: true,
            id: user._id,
        },
        JWT_SECRET,
        {
            expiresIn: '15h',
        }
    );
};


export const generateResetToken = (user) =>{
    return jwt.sign(
        {
            email: user.email,
            id: user._id,
        },
        JWT_SECRET,
        {
            expiresIn: "24h",
        }
    );
};

export const generateRefreshToken = async (user) => {
    const token = jwt.sign(
        {
            email: user.email,
        },
        JWT_SECRET,
        {
            expiresIn: '1d',
        }
    );
    user.refreshToken = token;
    await UpdateUser(user);
    return token;
}; 

export const verifyResetToken = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token, JWT_SECRET,
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
    console.log(user);
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    res.status(200).json({ email: user.email, accessToken: accessToken, refreshToken: refreshToken, isLoggedIn: true });
};

export const verifyToken = async(req,res,next) => {
    
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    if(!token){
        return res.status(401).json({message: 'No token provided'});
    }

    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
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
            return res.status(401).send({ message: 'Token has expired' });
        } else {
            return res.status(401).send({ message: 'Invalid Token' });
        }
    }
   
};


export const handleRefreshToken = async(req,res,next) => {
    const refreshToken = (req.headers.refreshtoken) || "";
    console.log(req.headers);
    console.log(refreshToken);
    if(!refreshToken){
        return res.status(401).send({message: "Refresh token missing"});
    }

    // check if it is the correct token
    try{
        const refreshTokenDecoded = jwt.verify(refreshToken, JWT_SECRET);
        if(!refreshTokenDecoded){
            return res.status(401).send({message: "Invalid refresh token"});
        }

        // if decoded check agaisnt users refresh token
        const user = await findUserByEmail(refreshTokenDecoded.email);
        if(user.refreshToken !== refreshToken){
            return res.status(401).send({message: "Invalid refresh Token for the user"});
        }

        // generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken  = await generateRefreshToken(user);

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken : newRefreshToken,
        });

    }catch(error){
        res.status(401).send({message:error});
    }
};

