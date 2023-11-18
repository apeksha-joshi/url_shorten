import {getUserUrls} from '../dbServices/urlServices.js'
import {updateUserRequestCount} from '../dbServices/userServices.js';
import customError from '../config/ApiCallError.js';

const getUserUrlList = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (userId !== req.body.user._id.toString()) {
            await updateUserRequestCount(req.body.user._id);
            next(new customError("Unauthroized to access the URLs of this user"), 403, 'warn')
            //res.status(401).json({ message: "Can fetch only your urls" });
            return;
        }

        const data = await getUserUrls(req.body.user._id);
        await updateUserRequestCount(req.body.user._id);
        res.status(200).json(data);
    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
        //res.status(500).json("Internal server error");
    }
}

export default {
    getUserUrlList,
};