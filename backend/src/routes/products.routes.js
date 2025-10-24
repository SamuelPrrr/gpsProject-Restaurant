import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Rutas 2 jala bien" });
});

export default router;
