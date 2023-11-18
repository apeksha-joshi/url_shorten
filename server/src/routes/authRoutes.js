import { Router } from "express";
import  authController from '../controller/authController.js';
import {manageUserRequestLimit} from '../middleware/manageUserRequestLimit.js';

const router = Router();

// login - make default?
router.post('/', authController.loginUser);

// signup
router.post('/register', authController.registerUser);

router.get('/refresh-token', authController.handleRefreshToken);

router.post('/forgot-password', authController.initiateForgotPassword);


router.post('/reset-password', authController.resetPassword);

router.get('/logout', authController.handleLogout);

export default router;