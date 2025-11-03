import { Router } from "express";
import { adminAuth } from "../middlewares/auth.middleware.js";
import { generateTicket } from "../controllers/tickets.controller.js";

const router = Router();

router.post("/:folio/print", adminAuth, generateTicket);

export default router;