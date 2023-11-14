import urlModel from '../models/urlModel.js';
import shortid from 'shortid';
import url from 'url';
import validUrl from 'valid-url';
import {createUrl, getByUserAndUrlCode} from '../dbServices/urlServices.js';
import {updateUserRequestCount} from '../dbServices/userServices.js';


//get redirect url

const getUrlByCode = async (req,res) => {
    const urlCode = req.params.urlCode;
    const userId = req.body.user._id;
    if(!urlCode) {
        res.status(400).send('Bad request');
    }
    try{
        const data = await getByUserAndUrlCode({urlCode: urlCode, userId:userId});
        if(!data){
            res.status(404).json({message:"Requested URL not found"});
            await updateUserRequestCount(userId);
            return;
        }
        await updateUserRequestCount(userId);
        res.status(301).redirect(data.originalLink);
    }catch(error){
        res.status(500).json({message:"Internal server error: Failed to fetch by urlCode"});
    }
};

//shorten URL

const shortenUrl = async (req,res) => {
    console.log("Inside shorten Url");
    const { originalLink, customName } = req.body;
    // console.log("inside controller",req.body);
    const userId = req.body.user._id;
    if(!originalLink) {
        await updateUserRequestCount(userId);
        return res.status(400).json({message:"Missing required paramaters: originalLink"});
    }

    // validate original link
    if(!isValidUrl(originalLink)){
        await updateUserRequestCount(userId);
        return res.status(400).json({message: 'Provided URL is invalid.'});
    }

    // check user has given customName
    if(customName) {
        // check if the given name already exists or is already used
        const existingUrlCode = await getByUserAndUrlCode({urlCode: customName, userId:userId});
        if(existingUrlCode){
            await updateUserRequestCount(userId);
            return res.status(400).json({message: 'Given custom short name is already in use.'}); 
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
    try{
        const data = await createUrl(newUrlEntry);
        await updateUserRequestCount(userId);
        res.status(201).json(data);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to save to DB. Check DB connection.' });
      }
};

// validate original URL
const isValidUrl = (originalLink) => {
    try {
    //   new URL(url.trim());
    //   return true;
    return validUrl.isUri(originalLink.trim());
    } catch (err) {
      return false;
    }
  };

// extract baseUrl
const extractBaseUrl = (originalLink) => {
    const urlObject = new url.URL(originalLink);
    console.log(`${urlObject.protocol}//${urlObject.host}`);
    return `${urlObject.protocol}//${urlObject.host}`;
};




export default {
    shortenUrl,
    getUrlByCode,
};