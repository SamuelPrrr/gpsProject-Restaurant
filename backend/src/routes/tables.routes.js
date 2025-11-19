import { Router } from "express";
import {
  upsertTable,
  listActiveTables,
  getTableById,
  closeTable,
  updateTable,
  generateBill,
} from "../controllers/tables.controller.js";
import { adminAuth as protect } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas (sin autenticación)
router.get("/", listActiveTables); // Listar mesas activas
router.get("/:id", getTableById); // Obtener mesa por ID

// Rutas protegidas (requieren autenticación)
router.post("/", protect, upsertTable); // Crear o actualizar mesa
router.put("/:id", protect, updateTable); // Actualizar mesa existente
router.put("/:id/close", protect, closeTable); // Cerrar mesa
router.post("/:tableNumber/generate-bill", protect, generateBill); // Generar cuenta

export default router;
