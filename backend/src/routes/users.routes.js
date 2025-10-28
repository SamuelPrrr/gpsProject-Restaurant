import { Router } from "express";
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, requireRole("administrator"), listUsers);

router.post("/", authMiddleware, requireRole("administrator"), createUser);

router.put("/:id", authMiddleware, requireRole("administrator"), updateUser);

router.delete("/:id", authMiddleware, requireRole("administrator"), deleteUser);

router.get("/:id", authMiddleware, requireRole("administrator"), getUserById);

router.get("/search/:term", authMiddleware, requireRole("administrator"), searchUsers);



export default router;
