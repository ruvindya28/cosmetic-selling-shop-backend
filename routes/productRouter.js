import express from 'express';
import { createProduct, deleteProduct, getArrivals, getBestSellers, getProductById, getProducts, searchProducts, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",createProduct)
productRouter.get("/",getProducts)
productRouter.get("/new-arrivals",getArrivals)
productRouter.get("/best-sellers",getBestSellers)
productRouter.get("/search/:id",searchProducts)
productRouter.get("/:id",getProductById)
productRouter.delete("/:productId",deleteProduct)
productRouter.put("/:productId",updateProduct)

export default productRouter;

