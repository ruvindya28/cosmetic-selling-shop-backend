import express from 'express';
import { createOrder, deleteOrder, getOrder, updateOrder } from '../controllers/orderController.js';


const orderRouter = express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/",getOrder)
orderRouter.put("/:orderId",updateOrder)
orderRouter.delete("/:orderId", deleteOrder);

export default orderRouter;