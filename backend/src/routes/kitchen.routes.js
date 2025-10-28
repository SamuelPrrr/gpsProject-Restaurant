import express from "express";
import {
  getKitchenOrders,
  markOrderInProgress,
  markOrderReady,
  cancelOrderFromKitchen,
} from "../controllers/kitchen.controllers.js";

const router = express.Router();


router.get("/", getKitchenOrders);
router.put("/:orderId/in-progress", markOrderInProgress);
router.put("/:orderId/ready", markOrderReady);
router.put("/:orderId/cancel", cancelOrderFromKitchen);

export default router;