import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../services/firebaseAdmin.js";
import dotenv from "dotenv";

dotenv.config();

const USERS = "users";

export const loginAdmin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const query = await db
      .collection(USERS)
      .where("identifier", "==", identifier)
      .where("role", "==", "administrator")
      .limit(1)
      .get();

    if (query.empty) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    const doc = query.docs[0];
    const user = { id: doc.id, ...doc.data() };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        uid: user.id,
        role: user.role,
        identifier: user.identifier,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Inicio de sesión exitoso ",
      token,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        firstLogin: user.firstLogin || false,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
