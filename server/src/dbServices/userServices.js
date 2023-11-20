import User from '../models/userModel.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import {generateResetToken} from '../middleware/auth.js';

export const validateUserLogin = async (payload) => {
    try{
        const user = await User.findOne({email:payload.email});
        if(!user) return false;

        const passwordMatch = await comparePassword(payload.password, user.password);
        if(!passwordMatch) return false;

        return user;
    }catch(error){
        throw Error(error);
    }
}

export const createUser = async (payload) => {
    try{
        const hashedPassword = await hashPassword(payload.password);
        const user = await User.create({
            ...payload,
            password : hashedPassword,
            requestCount: 0,
        });
        return user;
    }catch(error){
        throw Error(error);
    }
};

export const updateUserRequestCount = async(userId) =>{
    try{
        const user = await User.findOne({_id: userId});
        if(!user){
            throw new Error("User not found");
        }
        user.requestCount++;
        await user.save();
    }catch(error){
        throw Error(error);
    }
};

export const UpdateUser = async (user) => {
    try{
        await User.findOneAndUpdate({email:user.email}, user);
    }
    catch(error){
        throw Error(error);
    }
};

export const findUserByEmail = async(email) => {
    try{
        const user = await User.findOne({email: email});
        if(!user){
            throw new Error("User not found");
        }
        return user;
    }catch(error){
        throw Error(error);
    }
};

export const handleForgotPassword = async (email) => {
    try{
        const user = await findUserByEmail(email);
        const resetToken = generateResetToken(user);
        user.resetToken = resetToken;
        await UpdateUser(user);
        return resetToken;
    }catch(error){
        throw new Error(error);
    }
};

export const updateResetPassword = async(newPassword, email) => {
    try{
        const user = await findUserByEmail(email);
        user.password = await hashPassword(newPassword);
        user.resetToken = "";
        await UpdateUser(user);
        const testReset = await comparePassword(newPassword,user.password);
        return testReset;
    }catch(error){
        throw new Error(error);
    }
}