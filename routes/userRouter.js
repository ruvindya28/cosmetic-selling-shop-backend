import express from 'express';
import { deleteUser, getAllUsers, getCurreentUser, googleLogin, loginUser, saveUser } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post("/",saveUser)
userRouter.post("/login",loginUser)
userRouter.post("/google", googleLogin);
userRouter.get("/current",getCurreentUser);

userRouter.get("/admin/all", getAllUsers);
userRouter.delete("/:userId",deleteUser)

export default userRouter;