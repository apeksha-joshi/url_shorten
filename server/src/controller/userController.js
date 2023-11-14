import {getUserUrls} from '../dbServices/urlServices.js'
import {updateUserRequestCount} from '../dbServices/userServices.js';

const getUserUrlList = async (req,res,next) => {
    const userId = req.params.userId;
    if(userId !== req.body.user._id.toString()) {
        await updateUserRequestCount(req.body.user._id);
        res.status(401).json({message:"Can fetch only your urls"});
        return;
    }

    try{
        const data = await getUserUrls(req.body.user._id);
        await updateUserRequestCount(req.body.user._id);
        res.status(200).json(data);
    }catch(error){
        res.status(500).json("Internal server error");
    }
}

export default {
    getUserUrlList,
};