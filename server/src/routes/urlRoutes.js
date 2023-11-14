import { Router  }  from "express";
import urlController from '../controller/urlController.js';
import { verifyToken } from "../middleware/auth.js";
import {checkRequestLimit} from '../middleware/checkRequestLimit.js';
import {manageUserRequestLimit} from '../middleware/manageUserRequestLimit.js';

const router = Router();

// Create a new shortened URL
router.post('/', verifyToken, manageUserRequestLimit, checkRequestLimit, urlController.shortenUrl);

// redirect from urlCode
router.get('/:urlCode', verifyToken, manageUserRequestLimit,  checkRequestLimit, urlController.getUrlByCode);

export default router;