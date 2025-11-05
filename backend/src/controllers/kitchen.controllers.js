import { db, admin } from "../server/firebaseAdmin.js";

const ORDERS = "orders";

// RF5.1 
export async function getKitchenOrders(req, res) {
  try {
    const { status } = req.query;

    let query = db.collection(ORDERS).orderBy("createdAt", "asc");

    if (status && ["new", "in_progress", "ready"].includes(status)) {
      query = query.where("status", "==", status);
    } else {
      query = query.where("status", "in", ["new", "in_progress", "ready"]);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json({ message: "No hay pedidos en cocina", orders: [] });
    }

    const orders = snapshot.docs.map(d => {
      const data = d.data();
      const createdAt = data.createdAt?.toDate();
      const elapsed = createdAt
        ? Math.floor((Date.now() - createdAt.getTime()) / 1000 / 60)
        : 0;

      return {
        id: d.id,
        tableNumber: data.tableNumber,
        waiterName: data.waiterName,
        items: data.items,
        observations: data.observations || "",
        status: data.status,
        timeElapsedMinutes: elapsed,
      };
    });

    return res.json({ orders });
  } catch (err) {
    console.error("getKitchenOrders error:", err);
    return res.status(500).json({ message: "Error al obtener pedidos" });
  }
}

// RF5.2
export async function markOrderInProgress(req, res) {
  try {
    const { orderId } = req.params;
    const ref = db.collection(ORDERS).doc(orderId);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Pedido no encontrado" });

    const order = doc.data();

    if (order.status !== "new") {
      return res.status(400).json({ message: "El pedido ya fue procesado" });
    }

    await ref.update({
      status: "in_progress",
      inProgressAt: admin.firestore.FieldValue.serverTimestamp(),
      processedBy: req.user?.identifier || "kitchen",
    });

    return res.json({ message: "Pedido marcado como en preparación" });
  } catch (err) {
    console.error("markOrderInProgress error:", err);
    return res.status(500).json({ message: "Error al actualizar pedido" });
  }
}

// RF5.3 
export async function markOrderReady(req, res) {
  try {
    const { orderId } = req.params;
    const ref = db.collection(ORDERS).doc(orderId);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Pedido no encontrado" });

    const order = doc.data();

    if (order.status !== "in_progress") {
      return res.status(400).json({ message: "El pedido no está en preparación" });
    }

    const createdAt = order.createdAt?.toDate();
    const preparationTime = createdAt
      ? Math.floor((Date.now() - createdAt.getTime()) / 1000 / 60)
      : 0;

    await ref.update({
      status: "ready",
      readyAt: admin.firestore.FieldValue.serverTimestamp(),
      completedBy: req.user?.identifier || "kitchen",
      preparationTimeMinutes: preparationTime,
    });

    return res.json({
      message: "Pedido marcado como listo para servir",
      preparationTimeMinutes: preparationTime,
    });
  } catch (err) {
    console.error("markOrderReady error:", err);
    return res.status(500).json({ message: "Error al marcar pedido como listo" });
  }
}

// RF5.4 
export async function cancelOrderFromKitchen(req, res) {
  try {
    const { orderId } = req.params;
    const { missingIngredient, reason } = req.body;

    if (!missingIngredient || missingIngredient.length < 5) {
      return res.status(400).json({
        message: "Debe especificar el ingrediente faltante (mínimo 5 caracteres)",
      });
    }

    const ref = db.collection(ORDERS).doc(orderId);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Pedido no encontrado" });

    const order = doc.data();

    if (["in_progress", "ready"].includes(order.status)) {
      return res.status(400).json({
        message: "No se puede cancelar un pedido ya en preparación o listo",
      });
    }

    await ref.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: req.user?.identifier || "kitchen",
      missingIngredient,
      cancellationReason: reason || "",
    });

    return res.json({
      message: `Pedido ${orderId} cancelado por falta de ingrediente`,
    });
  } catch (err) {
    console.error("cancelOrderFromKitchen error:", err);
    return res.status(500).json({ message: "Error al cancelar pedido" });
  }
}
