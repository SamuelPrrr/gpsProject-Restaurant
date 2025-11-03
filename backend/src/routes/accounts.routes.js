import { Router } from "express";
import { waiterTokenAuth, adminAuth } from "../middlewares/auth.middleware.js";

import {
  getAccountByTable,
  closeAccount,
  getAccountHistory,
  modifyAccount,
  cancelAccount,
} from "../controllers/accounts.controller.js";

const router = Router();

router.get("/:tableNumber", waiterTokenAuth, getAccountByTable);

router.put("/:tableNumber/close", waiterTokenAuth, closeAccount);

router.get("/", adminAuth, getAccountHistory);

router.put("/:tableNumber/modify", waiterTokenAuth, modifyAccount);

router.put("/:folio/cancel", adminAuth, cancelAccount);

export default router;