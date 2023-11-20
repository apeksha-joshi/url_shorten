import shortid from 'shortid';
import url from 'url';
import validUrl from 'valid-url';
import { createUrl, getByUserAndUrlCode } from '../dbServices/urlServices.js';
import { updateUserRequestCount } from '../dbServices/userServices.js';
import customError from '../config/ApiCallError.js';

//get redirect url
const getUrlByCode = async (req, res, next) => {
    try {
        const urlCode = req.params.urlCode;
        const userId = req.body.user._id;

        const data = await getByUserAndUrlCode({ urlCode: urlCode, userId: userId });
        if (!data) {
            await updateUserRequestCount(userId);
            return next(new customError("Requested URL not found/unauthorized", 403, 'warn'));
        }
        await updateUserRequestCount(userId);
        res.status(301).redirect(data.originalLink);
    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
};

//shorten URL

const shortenUrl = async (req, res, next) => {
    try {
        const { originalLink, customName } = req.body;
        const userId = req.body.user._id;
        if (!originalLink) {
            await updateUserRequestCount(userId);
            return next(new customError("Missing required paramater: originalLink", 400, 'warn'));
        }

        // validate original link
        if (!isValidUrl(originalLink)) {
            await updateUserRequestCount(userId);
            return next(new customError("Provided URL is invalid", 400, 'warn'));
        }

        // check user has given customName
        if (customName) {
            const existingUrlCode = await getByUserAndUrlCode({ urlCode: customName, userId: userId });
            if (existingUrlCode) {
                await updateUserRequestCount(userId);
                return next(new customError("Given custom short name is already in use", 400, 'warn'));
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
    return `${urlObject.protocol}//${urlObject.host}`;
};




export default {
    shortenUrl,
    getUrlByCode,
};