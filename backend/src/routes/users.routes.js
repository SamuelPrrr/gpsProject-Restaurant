import { Router } from "express";
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  getUserById,
  searchUsers,
} from "../controllers/users.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(adminAuth);

router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUserById);
router.get("/search/:term", searchUsers);

export default router;