import express from "express";
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orders.controller.js";
import { waiterTokenAuth, adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", waiterTokenAuth, createOrder);
router.get("/", waiterTokenAuth, listOrders);
router.get("/:id", waiterTokenAuth, getOrderById);
router.put("/:id", waiterTokenAuth, updateOrder);
router.delete("/:id", waiterTokenAuth, deleteOrder);


router.get("/admin/all", adminAuth, listOrders);

export default router;
