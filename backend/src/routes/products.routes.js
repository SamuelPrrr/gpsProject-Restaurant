import { Router } from "express";
import { adminAuth, waiterTokenAuth } from "../middlewares/auth.middleware.js";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductsByName,
  filterProductsByCategory,
} from "../controllers/products.controller.js";

const router = Router();


router.get("/", waiterTokenAuth, listProducts);
router.get("/:id", waiterTokenAuth, getProductById);
router.get("/search/:term", waiterTokenAuth, searchProductsByName);
router.get("/category/:category", waiterTokenAuth, filterProductsByCategory);


router.post("/", adminAuth, createProduct);
router.put("/:id", adminAuth, updateProduct);
router.delete("/:id", adminAuth, deleteProduct);

export default router;