import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { db, admin } from "../services/firebaseAdmin.js";

const USERS = "users";

//R1.2
export async function listUsers(req, res) {
  try {
    const snapshot = await db.collection(USERS).get();
    const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(users);
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ message: "Error al listar usuarios" });
  }
}

// R1.1
export async function createUser(req, res) {
  try {
    const { firstName, lastName, identifier, role } = req.body;

    if (!firstName || !lastName || !identifier || !role) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (role === "administrator") {
      return res.status(403).json({ message: "No está permitido crear nuevos administradores" });
    }

    const dup = await db
      .collection(USERS)
      .where("identifier", "==", identifier)
      .limit(1)
      .get();

    if (!dup.empty) return res.status(409).json({ message: "El identifier ya existe" });

    const now = admin.firestore.FieldValue.serverTimestamp();
    const token = uuidv4().split("-")[0].toUpperCase();

    const docData = {
      firstName,
      lastName,
      identifier,
      role,
      token,
      passwordHash: null,
      createdAt: now,
      updatedAt: now,
      firstLogin: false,
      failedAttempts: 0,
      lockedUntil: null,
      cannotDelete: false,
    };

    const ref = await db.collection(USERS).add(docData);

    return res.status(201).json({
      id: ref.id,
      identifier,
      role,
      token,
      message: "Usuario creado correctamente",
    });
  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({ message: "Error al crear usuario" });
  }
}

// R1.3
export async function updateUser(req, res) {
  try {
    const id = req.params.id;
    const changes = req.body;

    const userRef = db.collection(USERS).doc(id);
    const snap = await userRef.get();

    if (!snap.exists) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = snap.data();

    if (user.role === "administrator") {
      return res.status(403).json({ message: "No se permite modificar al administrador" });
    }

    if (changes.identifier && changes.identifier !== user.identifier) {
      return res.status(400).json({ message: "El identifier no puede modificarse" });
    }

    const updateDoc = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (changes.firstName) updateDoc.firstName = changes.firstName;
    if (changes.lastName) updateDoc.lastName = changes.lastName;
    if (changes.role && changes.role !== "administrator") updateDoc.role = changes.role;

    await userRef.update(updateDoc);

    return res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
}

//R1.4
export async function deleteUser(req, res) {
  try {
    const id = req.params.id;
    const userRef = db.collection(USERS).doc(id);
    const snap = await userRef.get();

    if (!snap.exists) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = snap.data();

    if (user.role === "administrator") {
      return res.status(403).json({ message: "No se puede eliminar al administrador" });
    }

    await userRef.delete();

    return res.json({ message: "Usuario eliminado correctamente " });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Error al eliminar usuario" });
  }
}
