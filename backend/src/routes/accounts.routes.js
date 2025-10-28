import { Router } from "express";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import {
  getAccountByTable,
  closeAccount,
  getAccountHistory,
  modifyAccount,
  cancelAccount,
} from "../controllers/accounts.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/:tableNumber", getAccountByTable);
 
router.put("/:tableNumber/close", closeAccount);

router.get("/", requireRole("administrator"), getAccountHistory);

router.put("/:tableNumber/modify", modifyAccount);

router.put("/:folio/cancel", requireRole("administrator"), cancelAccount);

export default router;
