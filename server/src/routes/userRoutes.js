import { Router } from "express";
import  userController from '../controller/userController.js';
import { verifyToken } from "../middleware/auth.js";
import {checkRequestLimit} from '../middleware/checkRequestLimit.js';
import {manageUserRequestLimit} from '../middleware/manageUserRequestLimit.js';

const router = Router();


router.get('/:userId/urls', verifyToken, manageUserRequestLimit, checkRequestLimit, userController.getUserUrlList);

export default router;