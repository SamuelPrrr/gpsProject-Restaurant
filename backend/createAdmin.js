import bcrypt from "bcrypt";
import { db, admin } from "./src/server/firebaseAdmin.js";

async function createAdmin() {
  try {
    const usersRef = db.collection("users");
    
    // Contraseña: admin123
    const password = "admin123";
    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = {
      firstName: "Test",
      lastName: "Admin",
      identifier: "Admin",
      passwordHash,
      role: "administrator",
      firstLogin: false,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await usersRef.add(newAdmin);

    console.log("✅ Administrador creado exitosamente!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`ID: ${docRef.id}`);
    console.log(`Usuario: ${newAdmin.identifier}`);
    console.log(`Contraseña: ${password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al crear administrador:", err);
    process.exit(1);
  }
}

createAdmin();
