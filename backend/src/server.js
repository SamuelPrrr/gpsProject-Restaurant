import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

//Rutas (No van pal centro, camara)
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productsRoutes from "./routes/products.routes.js";



const app = express();

app.use(cors());              
app.use(express.json());  

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);

app.get("/", (req, res) => {
  res.send("Ey que paso, llego el q anima");
});

const PORT = process.env.PORT || 4000;

import { ensureAdminExists } from "./services/initAdmin.js";

ensureAdminExists();

app.listen(PORT, () => {
  console.log(`Ya jalo, eñ servidor anda corriendo en http://localhost:${PORT}`);
});