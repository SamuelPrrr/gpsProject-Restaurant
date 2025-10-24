import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Rutas 1 chambeando bien" });
});

export default router;
