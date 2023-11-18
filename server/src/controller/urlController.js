import urlModel from '../models/urlModel.js';
import shortid from 'shortid';
import url from 'url';
import validUrl from 'valid-url';
import {createUrl, getByUserAndUrlCode} from '../dbServices/urlServices.js';
import {updateUserRequestCount} from '../dbServices/userServices.js';
import customError from '../config/ApiCallError.js';

//get redirect url

const getUrlByCode = async (req,res, next) => {
    try{
    const urlCode = req.params.urlCode;
    const userId = req.body.user._id;
    
    const data = await getByUserAndUrlCode({urlCode: urlCode, userId:userId});
    if(!data){
        //res.status(404).json({message:"Requested URL not found"});
        await updateUserRequestCount(userId);
        return next(new customError("Requested URL not found/unauthorized", 403, 'warn'));
    }
    await updateUserRequestCount(userId);
    res.status(301).redirect(data.originalLink);
    }catch(error){
        next(new customError("Internal server error", 500, 'error'));
    }
};

//shorten URL

const shortenUrl = async (req, res, next) => {
    try {
        const { originalLink, customName } = req.body;
        //console.log("inside controller",req.body);
        const userId = req.body.user._id;
        if (!originalLink) {
            await updateUserRequestCount(userId);
            next(new customError("Missing required paramater: originalLink", 400, 'warn'));
            //return res.status(400).json({message:"Missing required paramaters: originalLink"});
        }

        // validate original link
        if (!isValidUrl(originalLink)) {
            console.log("Invalid URL")
            await updateUserRequestCount(userId);
            next(new customError("Provided URL is invalid", 400, 'warn'));
            //return res.status(400).json({message: 'Provided URL is invalid.'});
        }

        // check user has given customName
        if (customName) {
            // check if the given name already exists or is already used
            const existingUrlCode = await getByUserAndUrlCode({ urlCode: customName, userId: userId });
            if (existingUrlCode) {
                await updateUserRequestCount(userId);
                next(new customError("Given custom short name is already in use", 400, 'warn'));
                //return res.status(400).json({message: 'Given custom short name is already in use.'}); 
            }
        }

        // set urlCode
        const urlCode = customName || shortid.generate();

        const baseUrl = extractBaseUrl(originalLink);

        const newUrlEntry = {
            originalLink,
            baseUrl,
            urlCode,
            userId,
        }
        // save to db
        const data = await createUrl(newUrlEntry);
        await updateUserRequestCount(userId);
        res.status(201).json(data);

    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
};

// validate original URL
const isValidUrl = (originalLink) => {
    try {
        return validUrl.isUri(originalLink.trim());
    } catch (err) {
      return false;
    }
  };

// extract baseUrl
const extractBaseUrl = (originalLink) => {
    const urlObject = new url.URL(originalLink);
    //console.log(`${urlObject.protocol}//${urlObject.host}`);
    return `${urlObject.protocol}//${urlObject.host}`;
};




export default {
    shortenUrl,
    getUrlByCode,
};