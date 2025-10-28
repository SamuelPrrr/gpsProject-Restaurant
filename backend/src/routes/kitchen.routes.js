import express from "express";
import {
  getKitchenOrders,
  markOrderInProgress,
  markOrderReady,
  cancelOrderFromKitchen,
} from "../controllers/kitchen.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", authorizeRoles(["kitchen", "admin"]), getKitchenOrders);

router.put("/:orderId/in-progress", authorizeRoles(["kitchen", "admin"]), markOrderInProgress);

router.put("/:orderId/ready", authorizeRoles(["kitchen", "admin"]), markOrderReady);

router.put("/:orderId/cancel", authorizeRoles(["kitchen", "admin"]), cancelOrderFromKitchen);

export default router;
