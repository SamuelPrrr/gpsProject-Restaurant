import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { generateTicket } from "../controllers/tickets.controller.js";

const router = Router();

router.post("/:folio/print", authMiddleware, generateTicket);

export default router;