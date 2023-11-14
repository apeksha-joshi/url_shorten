import Tier from '../models/tierModel.js';

export const findById = async(tierId) => {
    try{
        const tierObj = await Tier.findOne({_id:tierId});
        return tierObj;
    }catch(error){
        throw Error(error);
    }
};