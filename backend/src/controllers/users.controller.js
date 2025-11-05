import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { db, admin } from "../server/firebaseAdmin.js";

const USERS = "users";

// R1.1
export async function createUser(req, res) {
  try {
    const { firstName, lastName, identifier, role } = req.body;

    if (!firstName || !lastName || !identifier || !role) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // if (role === "administrator") {
    //   return res.status(403).json({ message: "No está permitido crear nuevos administradores" });
    // }

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

export async function getUserById(req, res) {
  try {
    const id = req.params.id;
    const doc = await db.collection(USERS).doc(id).get();

    if (!doc.exists) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Error al obtener usuario" });
  }
}

export async function searchUsers(req, res) {
  try {
    const term = req.params.term.toLowerCase();
    const snapshot = await db.collection(USERS).get();

    const results = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((user) =>
        (user.firstName?.toLowerCase().includes(term)) ||
        (user.lastName?.toLowerCase().includes(term)) ||
        (user.identifier?.toLowerCase().includes(term))
      );

    return res.json(results);
  } catch (err) {
    console.error("searchUsers error:", err);
    return res.status(500).json({ message: "Error al buscar usuarios" });
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

// Get current user profile
export async function getProfile(req, res) {
  try {
    const userId = req.user.uid; // JWT usa 'uid' no 'id'
    const userRef = db.collection(USERS).doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = snap.data();
    return res.json({
      id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      identifier: user.identifier,
      role: user.role,
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Error al obtener perfil" });
  }
}

// Update admin profile
export async function updateProfile(req, res) {
  try {
    const userId = req.user.uid; // JWT usa 'uid' no 'id'
    const { firstName, lastName, currentPassword, newPassword } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "Nombre y apellido son obligatorios" });
    }

    const userRef = db.collection(USERS).doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = snap.data();
    const updateDoc = {
      firstName,
      lastName,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Debe proporcionar la contraseña actual" });
      }

      if (!user.passwordHash) {
        return res.status(400).json({ message: "No hay contraseña configurada para este usuario" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: "Contraseña actual incorrecta" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
      }

      // Hash new password
      const saltRounds = 10;
      const newHash = await bcrypt.hash(newPassword, saltRounds);
      updateDoc.passwordHash = newHash;
    }

    await userRef.update(updateDoc);

    return res.json({ 
      message: "Perfil actualizado correctamente",
      user: {
        id: userId,
        firstName,
        lastName,
        identifier: user.identifier,
        role: user.role
      }
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Error al actualizar perfil" });
  }
}
