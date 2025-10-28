import { db, admin } from "../services/firebaseAdmin.js";

const ACCOUNTS = "accounts";
const ORDERS = "orders";
const PRODUCTS = "products";

// RF4.1 
export async function getAccountByTable(req, res) {
  try {
    const { tableNumber } = req.params;
    if (!tableNumber || isNaN(tableNumber))
      return res.status(400).json({ message: "Número de mesa inválido" });

    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("tableNumber", "==", parseInt(tableNumber))
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (accountSnapshot.empty)
      return res.status(404).json({
        message: `La mesa ${tableNumber} no tiene cuenta activa.`,
      });

    const accountDoc = accountSnapshot.docs[0];
    const account = { id: accountDoc.id, ...accountDoc.data() };

    const ordersSnapshot = await db
      .collection(ORDERS)
      .where("accountId", "==", accountDoc.id)
      .where("status", "in", ["pendiente", "en_preparacion", "listo"])
      .get();

    let total = 0;
    const items = [];

    ordersSnapshot.forEach((orderDoc) => {
      const order = orderDoc.data();
      order.products?.forEach((item) => {
        const subtotal = item.quantity * item.price;
        total += subtotal;
        items.push({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal,
          notes: item.notes || "",
        });
      });
    });

    return res.json({
      tableNumber: account.tableNumber,
      waiter: account.waiterName,
      openedAt: account.openedAt,
      items,
      total: parseFloat(total.toFixed(2)),
      status: "open",
    });
  } catch (err) {
    console.error("getAccountByTable error:", err);
    return res.status(500).json({ message: "Error al consultar cuenta" });
  }
}

// RF4.2 
export async function closeAccount(req, res) {
  try {
    const { tableNumber } = req.params;
    const { paymentMethod, cashReceived } = req.body;

    if (!["cash", "debit_card", "credit_card"].includes(paymentMethod))
      return res.status(400).json({ message: "Método de pago inválido" });

    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("tableNumber", "==", parseInt(tableNumber))
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (accountSnapshot.empty)
      return res.status(404).json({ message: "No hay cuenta abierta para esta mesa" });

    const accountDoc = accountSnapshot.docs[0];

    const ordersSnapshot = await db
      .collection(ORDERS)
      .where("accountId", "==", accountDoc.id)
      .get();

    let total = 0;
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      order.products?.forEach((p) => {
        total += p.price * p.quantity;
      });
    });

    const counterRef = db.collection("counters").doc("accounts");
    const folio = await db.runTransaction(async (t) => {
      const counterDoc = await t.get(counterRef);
      const current = counterDoc.exists ? counterDoc.data().lastFolio : 0;
      const next = current + 1;
      t.set(counterRef, { lastFolio: next }, { merge: true });
      return next;
    });

    let change = 0;
    if (paymentMethod === "cash") {
      if (!cashReceived || cashReceived < total)
        return res.status(400).json({ message: "Monto recibido insuficiente" });
      change = +(cashReceived - total).toFixed(2);
    }

    await accountDoc.ref.update({
      status: "closed",
      closedAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod,
      total: parseFloat(total.toFixed(2)),
      folio,
      cashReceived: paymentMethod === "cash" ? cashReceived : null,
      change,
    });

    return res.json({
      message: "Cuenta cerrada correctamente",
      folio,
      total: parseFloat(total.toFixed(2)),
      paymentMethod,
      change,
    });
  } catch (err) {
    console.error("closeAccount error:", err);
    return res.status(500).json({ message: "Error al cerrar cuenta" });
  }
}

// RF4.3 
export async function getAccountHistory(req, res) {
  try {
    const { startDate, endDate, folio, tableNumber, waiterName } = req.query;

    if (!startDate || !endDate)
      return res.status(400).json({ message: "Fechas requeridas" });

    const start = new Date(startDate);
    const end = new Date(endDate);

    const snapshot = await db
      .collection(ACCOUNTS)
      .where("status", "==", "closed")
      .where("closedAt", ">=", admin.firestore.Timestamp.fromDate(start))
      .where("closedAt", "<=", admin.firestore.Timestamp.fromDate(end))
      .get();

    let accounts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (folio) accounts = accounts.filter((a) => a.folio == folio);
    if (tableNumber) accounts = accounts.filter((a) => a.tableNumber == tableNumber);
    if (waiterName)
      accounts = accounts.filter((a) =>
        a.waiterName?.toLowerCase().includes(waiterName.toLowerCase())
      );

    const totalAmount = accounts.reduce((sum, a) => sum + (a.total || 0), 0);

    return res.json({
      count: accounts.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      accounts,
    });
  } catch (err) {
    console.error("getAccountHistory error:", err);
    return res.status(500).json({ message: "Error al consultar historial" });
  }
}

// RF4.4 
export async function modifyAccount(req, res) {
  try {
    const { tableNumber } = req.params;
    const { action, productId, quantity, reason } = req.body;

    if (!["add", "remove"].includes(action))
      return res.status(400).json({ message: "Acción inválida" });

    if (action === "remove" && (!reason || reason.length < 10))
      return res.status(400).json({ message: "Debe indicar motivo válido" });

    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("tableNumber", "==", parseInt(tableNumber))
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (accountSnapshot.empty)
      return res.status(404).json({ message: "La cuenta ya está cerrada" });

    const accountDoc = accountSnapshot.docs[0];

    const productDoc = await db.collection(PRODUCTS).doc(productId).get();
    if (!productDoc.exists)
      return res.status(404).json({ message: "Producto no encontrado" });

    const product = productDoc.data();

    await db.collection("account_modifications").add({
      accountId: accountDoc.id,
      productId,
      productName: product.name,
      quantity,
      price: product.price,
      action,
      reason: action === "remove" ? reason : null,
      modifiedBy: req.user.identifier,
      modifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const msg =
      action === "add"
        ? `Producto ${product.name} agregado a mesa ${tableNumber}`
        : `Producto ${product.name} eliminado. Motivo: ${reason}`;

    return res.json({ message: msg });
  } catch (err) {
    console.error("modifyAccount error:", err);
    return res.status(500).json({ message: "Error al modificar cuenta" });
  }
}

// RF4.5 
export async function cancelAccount(req, res) {
  try {
    const { folio } = req.params;
    const { reason } = req.body;

    if (!folio || isNaN(folio))
      return res.status(400).json({ message: "Folio inválido" });
    if (!reason || reason.length < 10)
      return res.status(400).json({ message: "Debe indicar motivo válido" });

    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("folio", "==", parseInt(folio))
      .limit(1)
      .get();

    if (accountSnapshot.empty)
      return res.status(404).json({ message: "Cuenta no encontrada" });

    const accountDoc = accountSnapshot.docs[0];
    const account = accountDoc.data();

    if (account.status === "cancelled")
      return res.status(400).json({ message: "La cuenta ya está cancelada" });

    await accountDoc.ref.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: req.user.identifier,
      cancellationReason: reason,
    });

    return res.json({
      message: `Cuenta ${folio} cancelada correctamente.`,
    });
  } catch (err) {
    console.error("cancelAccount error:", err);
    return res.status(500).json({ message: "Error al cancelar cuenta" });
  }
}
