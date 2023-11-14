import { findUserByEmail, validateUserLogin, createUser, handleForgotPassword, updateResetPassword, UpdateUser } from '../dbServices/userServices.js'
import { getAuthToken, verifyResetToken } from '../middleware/auth.js';

const registerUser = async(req, res, next) => {
    // add additional validations for user input
    
    const payload = req.body;
    if(!payload.email || !payload.firstName || !payload.lastName || !payload.password) {
        res.status(400).json({message:"Missing required parameters"});
    }
    else{
        
        try{
            let existingUser;
            try{
                existingUser = await findUserByEmail(payload.email);
            }catch(error){
                console.log("No user registered with same email");
            }
            
            if(existingUser){
                res.status(401).json({message:"Email address not available"});
            }else{
                payload.lastLoginDate = Date();
                const newUser = await createUser(payload);
                req.body.user = newUser;
                getAuthToken(req,res);
            }
        }catch(error){
            res.status(500).json({message:"Internal server error"});        }
    }
}

const loginUser = async(req, res, next) => {
    const payload = req.body;
    // const updatedUser = req.body.user;
    
    if(!payload.email || !payload.password) {
        res.status(400).json({message: "Missing required parameters"});
    }else{
        const userData = await validateUserLogin(payload);
        if(userData === false){
            res.status(403).json({message:"Invalid email/password"});
        }else{
            if(typeof userData === "object" && userData.email) {
                const currentDateTime = new Date();
                const currDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
                const lastLoginDate = new Date(userData.lastLoginDate.getFullYear(), userData.lastLoginDate.getMonth(), userData.lastLoginDate.getDate());
                if (!userData.lastLoginDate || currDate.toDateString() !== lastLoginDate.toDateString()) {
                    userData.requestCount = 0;
                    userData.lastLoginDate = new Date();
                }
                await UpdateUser(userData);
                req.body.user = userData;
                getAuthToken(req,res);
            }else{
                res.status(403).json({message: "Invalid email/password"});
            }
        }
        
    }
}


const initiateForgotPassword = async(req, res, next) => {
    const email = req.body.email;
    if(!email){
        res.status(400).json({message:"Missing required parameters"});
    }else{
        try{
            const existingUser = await findUserByEmail(email);
            if(!existingUser){
                res.status(400).json({message:"Inavlid email"});
            }else{
                const resetToken = await handleForgotPassword(email);
                if (resetToken) {
                    res.status(200).json({ resetToken: resetToken });
                  } else {
                    res.status(500).json({message:"Internal server error"});
                  }
            }
        }catch(error){
            res.status(500).json({message:"Internal server error"});
        }
    }
}


const resetPassword = async(req, res, next) =>{
    const {resetToken, password} = req.body;
    if(!resetToken || !password) {
        res.status(400).json({message:"Missing required parameters"});
    }
    else{
        try{
            const email = await verifyResetToken(resetToken);
            
            if(email && typeof email === 'string'){
                const isReset = await updateResetPassword(password, email);
                
                if(isReset){
                    res.status(200).json({message:"Reset successful"});
                }else{
                    res.status(400).json({message:"Reset failed"});
                }
                
            }else{
                res.status(400).json({message:"Invalid ResetToken"});
            }
        }catch(error){
            res.status(500).json({message:"Internal server error"});
        }
    }
}

export default {
    registerUser,
    loginUser,
    initiateForgotPassword,
    resetPassword,
};