import { db, admin } from "../server/firebaseAdmin.js";

const COLLECTION = "orders";

// RF3.1 
export async function createOrder(req, res) {
  try {
    const { tableNumber, items, observations } = req.body;
    const user = req.user;

    if (!tableNumber || !items?.length) {
      return res.status(400).json({ message: "Faltan datos del pedido" });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const now = admin.firestore.FieldValue.serverTimestamp();

    const order = {
      tableNumber,
      waiterId: user.identifier,
      waiterName: `${user.firstName} ${user.lastName}`,
      items,
      observations: observations || "",
      total,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(COLLECTION).add(order);

    return res.status(201).json({
      message: "Pedido creado correctamente",
      id: ref.id,
      ...order,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Error al crear pedido" });
  }
}

// RF3.2 
export async function listOrders(req, res) {
  try {
    const user = req.user;
    let query = db.collection(COLLECTION).orderBy("createdAt", "desc");

    if (user.role === "waiter") {
      query = query.where("waiterId", "==", user.identifier);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return res.json(orders);
  } catch (err) {
    console.error("listOrders error:", err);
    return res.status(500).json({ message: "Error al listar pedidos" });
  }
}

// RF3.3 
export async function getOrderById(req, res) {
  try {
    const id = req.params.id;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists)
      return res.status(404).json({ message: "Pedido no encontrado" });

    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Error al obtener pedido" });
  }
}

// RF3.4 
export async function updateOrder(req, res) {
  try {
    const id = req.params.id;
    const user = req.user;
    const changes = req.body;

    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Pedido no encontrado" });

    const order = doc.data();

    if (user.role === "waiter") {
      if (order.waiterId !== user.identifier)
        return res.status(403).json({ message: "No puedes modificar pedidos de otro mesero" });
      if (order.status !== "new")
        return res.status(403).json({ message: "Solo puedes modificar pedidos nuevos" });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (changes.items && order.status === "new") {
      updateData.items = changes.items;
      updateData.total = changes.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    }

    if (changes.observations !== undefined)
      updateData.observations = changes.observations;

    await ref.update(updateData);
    return res.json({ message: "Pedido actualizado correctamente" });
  } catch (err) {
    console.error("updateOrder error:", err);
    return res.status(500).json({ message: "Error al actualizar pedido" });
  }
}

// RF3.5 
export async function deleteOrder(req, res) {
  try {
    const id = req.params.id;
    const user = req.user;

    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Pedido no encontrado" });

    const order = doc.data();

    if (user.role !== "waiter")
      return res.status(403).json({ message: "Solo los meseros pueden eliminar pedidos" });

    if (order.waiterId !== user.identifier)
      return res.status(403).json({ message: "No puedes eliminar pedidos de otro mesero" });

    if (order.status !== "new")
      return res.status(403).json({ message: "Solo se pueden eliminar pedidos nuevos" });

    await ref.delete();
    return res.json({ message: "Pedido eliminado correctamente" });
  } catch (err) {
    console.error("deleteOrder error:", err);
    return res.status(500).json({ message: "Error al eliminar pedido" });
  }
}
