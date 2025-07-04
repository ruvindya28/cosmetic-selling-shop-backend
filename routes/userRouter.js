import express from 'express';
import { changePassword, deleteUser, getAllUsers, getCurreentUser, googleLogin, loginUser, saveUser, sendOtp } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post("/",saveUser)
userRouter.post("/login",loginUser)
userRouter.post("/google", googleLogin);
userRouter.get("/current",getCurreentUser);
userRouter.post("/sendMail",sendOtp);
userRouter.post("/changePassword",changePassword);

userRouter.get("/admin/all", getAllUsers);
userRouter.delete("/:userId",deleteUser)

export default userRouter;