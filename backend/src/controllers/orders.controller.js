import { db, admin } from "../services/firebaseAdmin.js";

const COLLECTION = "orders";

export async function createOrder(req, res) {
  try {
    const { table, products, notes } = req.body;
    const user = req.user;

    if (!table || !products || !products.length) {
      return res.status(400).json({ message: "Faltan datos del pedido" });
    }

    const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const now = admin.firestore.FieldValue.serverTimestamp();

    const order = {
      waiterId: user.uid || user.identifier,
      waiterName: `${user.firstName || "Desconocido"} ${user.lastName || ""}`,
      table,
      products,
      total,
      status: "pendiente",
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(COLLECTION).add(order);

    return res.status(201).json({
      message: "Pedido creado correctamente ✅",
      id: ref.id,
      ...order,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Error al crear pedido" });
  }
}

export async function listOrders(req, res) {
  try {
    const user = req.user;
    let snapshot;

    if (user.role === "waiter") {
      snapshot = await db
        .collection(COLLECTION)
        .where("waiterId", "==", user.identifier)
        .orderBy("createdAt", "desc")
        .get();
    } else {
      snapshot = await db
        .collection(COLLECTION)
        .orderBy("createdAt", "desc")
        .get();
    }

    const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(orders);
  } catch (err) {
    console.error("listOrders error:", err);
    return res.status(500).json({ message: "Error al listar pedidos" });
  }
}

export async function getOrderById(req, res) {
  try {
    const id = req.params.id;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) return res.status(404).json({ message: "Pedido no encontrado" });

    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Error al obtener pedido" });
  }
}

export async function updateOrder(req, res) {
  try {
    const id = req.params.id;
    const user = req.user;
    const changes = req.body;

    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ message: "Pedido no encontrado" });

    const order = doc.data();

    if (user.role === "waiter" && order.status !== "pendiente") {
      return res.status(403).json({ message: "No puedes modificar un pedido ya enviado" });
    }

    if (user.role === "kitchen" && !["pendiente", "en_preparacion"].includes(order.status)) {
      return res.status(403).json({ message: "No puedes modificar un pedido ya listo o entregado" });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (changes.status) updateData.status = changes.status;
    if (changes.notes !== undefined) updateData.notes = changes.notes;

    if (user.role === "waiter" && changes.products && order.status === "pendiente") {
      updateData.products = changes.products;
      updateData.total = changes.products.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
    }

    await ref.update(updateData);
    return res.json({ message: "Pedido actualizado correctamente ✅" });
  } catch (err) {
    console.error("updateOrder error:", err);
    return res.status(500).json({ message: "Error al actualizar pedido" });
  }
}


export async function deleteOrder(req, res) {
  try {
    const id = req.params.id;
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ message: "Pedido no encontrado" });

    await ref.delete();
    return res.json({ message: "Pedido eliminado correctamente ✅" });
  } catch (err) {
    console.error("deleteOrder error:", err);
    return res.status(500).json({ message: "Error al eliminar pedido" });
  }
}
