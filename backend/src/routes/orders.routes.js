import express from "express";
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orders.controller.js";
import { waiterTokenAuth, adminAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas específicas primero (antes de las rutas con parámetros dinámicos)
router.get("/public/list", listOrders);
router.get("/admin/all", adminAuth, listOrders);

// Rutas protegidas
router.post("/", waiterTokenAuth, createOrder);
router.get("/:id", waiterTokenAuth, getOrderById);
router.put("/:id", waiterTokenAuth, updateOrder);
router.delete("/:id", waiterTokenAuth, deleteOrder);

export default router;
