import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", authMiddleware, listProducts);
router.get("/:id", authMiddleware, getProductById);
router.get("/search/:term", authMiddleware, searchProductsByName);
router.get("/category/:category", authMiddleware, filterProductsByCategory);


router.post("/", authMiddleware, requireRole("administrator"), createProduct);
router.put("/:id", authMiddleware, requireRole("administrator"), updateProduct);
router.delete("/:id", authMiddleware, requireRole("administrator"), deleteProduct);




export default router;
