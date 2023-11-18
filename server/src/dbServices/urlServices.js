import urlModel from '../models/urlModel.js';

export const createUrl = async (payload) =>{
    if (!payload.originalLink || !payload.userId){
        throw Error("Missing required paramaters");
    }
    
    try{
        const url = new urlModel(payload);
        const savedUrl = await url.save();
        return savedUrl;
    }catch (error) {
        throw Error(error);
      }
};

export const getByUrlCode = async (urlCode) => {
    try{
        const urlObj = await urlModel.findOne({urlCode : urlCode});
        return urlObj;
    }catch(error){
        throw Error(error);
    }
}

export const getByUserAndUrlCode = async (data) => {
    const urlCode = data.urlCode;
    const userId  = data.userId;
    try{
        const urlObj = await urlModel.findOne({urlCode : urlCode, userId:userId});
        return urlObj;
    }catch(error){
        throw Error(error);
    }
}

export const getUserUrls = async (userId) => {
    try{
        const urls = await urlModel.find({userId: userId}).exec();
        console.log("User Urls", urls);
        return urls;
    }catch(error){
        throw new Error("Internal server error");
    }
}