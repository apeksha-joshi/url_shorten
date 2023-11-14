import { Router } from "express";
import  authController from '../controller/authController.js';
import { handleRefreshToken } from "../middleware/auth.js";
import {manageUserRequestLimit} from '../middleware/manageUserRequestLimit.js';

const router = Router();

// login - make default?
router.post('/', authController.loginUser);

// signup
router.post('/signup', authController.registerUser);

router.get('/refresh-token', handleRefreshToken);

router.post('/forgot-password', authController.initiateForgotPassword);


router.post('/reset-password', authController.resetPassword);

export default router;