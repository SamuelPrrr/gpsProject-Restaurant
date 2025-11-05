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


router.get("/", listProducts);
router.get("/search/:term", searchProductsByName);
router.get("/category/:category", filterProductsByCategory);
router.get("/:id", getProductById);


router.post("/", adminAuth, createProduct);
router.put("/:id", adminAuth, updateProduct);
router.delete("/:id", adminAuth, deleteProduct);

export default router;