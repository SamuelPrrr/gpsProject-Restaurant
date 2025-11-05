import { db, admin } from "../server/firebaseAdmin.js";

export async function initProducts() {
  const snapshot = await db.collection("products").limit(1).get();
  if (!snapshot.empty) return; // Ya existen productos

  console.log(" Inicializando colección 'products'...");

  const now = admin.firestore.FieldValue.serverTimestamp();
  const baseProducts = [
    {
      name: "Mojarra Frita",
      description: "Mojarra frita en aceite",
      price: 85,
      category: "Comidas",
      available: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin",
    },
    {
      name: "Coca chica",
      description: "Coca-Cola 355ml",
      price: 25,
      category: "Bebidas",
      available: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin",
    },
  ];

  const batch = db.batch();
  baseProducts.forEach((p) => {
    const ref = db.collection("products").doc();
    batch.set(ref, p);
  });

  await batch.commit();
  console.log("✅ Productos iniciales creados");
}
