import bcrypt from "bcrypt";
import { db, admin } from "./firebaseAdmin.js";

export async function ensureAdminExists() {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("role", "==", "administrator").limit(1).get();

    if (!snapshot.empty) {
      console.log("Ya existe un administrador en la base de datos.");
      return;
    }

    const tempPassword = Math.random().toString(36).substring(2, 8); 
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newAdmin = {
      firstName: "Administrador",
      lastName: "Principal",
      identifier: "admin",
      passwordHash,
      role: "administrator",
      firstLogin: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await usersRef.add(newAdmin);

    console.log("Administrador inicial creado:");
    console.log(`ID: ${docRef.id}`);
    console.log(`Usuario: ${newAdmin.identifier}`);
    console.log(`Contraseña temporal: ${tempPassword}`);
    console.log("Guarda esta contraseña, el usuario deberá cambiarla en su primer login.");
  } catch (err) {
    console.error("Error al inicializar administrador:", err);
  }
}
