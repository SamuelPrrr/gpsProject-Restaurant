import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../services/firebaseAdmin.js";
dotenv.config();


export function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token JWT no proporcionado" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}


export async function waiterTokenAuth(req, res, next) {
  try {
    const token =
      req.headers["x-waiter-token"] ||
      req.query.token ||
      req.body.token;

    if (!token) {
      return res.status(401).json({ message: "Token de mesero no proporcionado" });
    }


    const snapshot = await db
      .collection("users")
      .where("role", "==", "waiter")
      .where("accessToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(403).json({ message: "Token de mesero inválido" });
    }

    const waiterDoc = snapshot.docs[0];
    req.user = { id: waiterDoc.id, ...waiterDoc.data() };
    next();
  } catch (err) {
    console.error("Error en waiterTokenAuth:", err);
    return res.status(500).json({ message: "Error al verificar token del mesero" });
  }
}
