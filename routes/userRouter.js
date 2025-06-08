import express from 'express';
import { getCurreentUser, googleLogin, loginUser, saveUser } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post("/",saveUser)
userRouter.post("/login",loginUser)
userRouter.post("/google", googleLogin);
userRouter.get("/current",getCurreentUser);

export default userRouter;