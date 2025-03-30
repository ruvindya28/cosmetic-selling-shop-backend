import express from 'express';
import { creacteOrder } from '../controllers/orderController.js';


const orderRouter = express.Router();

orderRouter.post("/",creacteOrder)

export default orderRouter;