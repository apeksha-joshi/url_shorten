import Tier from '../models/tierModel.js';

export const findById = async(tierId) => {
    try{
        const tierObj = await Tier.findOne({_id:tierId});
        return tierObj;
    }catch(error){
        throw Error(error);
    }
};


export const findDefaultTier = async () => {
    try{
        const defaultTier = await Tier.findOne().sort({ maxRequests: 1 });
        return defaultTier;
    }catch(error){
        throw Error(error);
    }
};