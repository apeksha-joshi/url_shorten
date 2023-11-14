import { Router  } from 'express';
import urlRouter from './urlRoutes.js';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';

const router = Router();

router.use("/auth", authRouter);
router.use("/urls", urlRouter);
router.use("/users", userRouter);

export default router;