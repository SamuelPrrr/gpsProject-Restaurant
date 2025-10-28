import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import {
  getAccountByTable,
  closeAccount,
  getAccountHistory,
  modifyAccount,
  cancelAccount
} from "../controllers/accounts.controller.js";

const router = Router();

// RF4.1 
router.get("/table/:tableNumber", authMiddleware, getAccountByTable);

// RF4.2 
router.post("/table/:tableNumber/close", authMiddleware, closeAccount);

// RF4.3 
router.get("/history", authMiddleware, requireRole("administrator"), getAccountHistory);

// RF4.4 
router.patch("/table/:tableNumber", authMiddleware, modifyAccount);

// RF4.5 
router.delete("/folio/:folio/cancel", authMiddleware, requireRole("administrator"), cancelAccount);

export default router;