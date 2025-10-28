import { db, admin } from "../services/firebaseAdmin.js";

const ACCOUNTS = "accounts";
const ORDERS = "orders";
const PRODUCTS = "products";

// RF4.1 - Consultar Cuenta Actual de Mesa
export async function getAccountByTable(req, res) {
  try {
    const { tableNumber } = req.params;

    if (!tableNumber || isNaN(tableNumber)) {
      return res.status(400).json({ message: "Número de mesa inválido" });
    }

    // Buscar cuenta abierta de la mesa
    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("tableNumber", "==", parseInt(tableNumber))
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (accountSnapshot.empty) {
      return res.status(404).json({ 
        message: `La mesa ${tableNumber} no tiene productos ordenados` 
      });
    }

    const accountDoc = accountSnapshot.docs[0];
    const account = { id: accountDoc.id, ...accountDoc.data() };

    // Obtener todos los pedidos de la cuenta
    const ordersSnapshot = await db
      .collection(ORDERS)
      .where("accountId", "==", accountDoc.id)
      .where("status", "!=", "cancelled")
      .get();

    const orders = ordersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calcular total
    let total = 0;
    const items = [];

    for (const order of orders) {
      for (const item of order.items || []) {
        const productDoc = await db.collection(PRODUCTS).doc(item.productId).get();
        const product = productDoc.data();
        
        const subtotal = item.quantity * item.price;
        total += subtotal;

        items.push({
          name: product?.name || "Producto desconocido",
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal,
          observations: item.observations || ""
        });
      }
    }

    return res.json({
      tableNumber: account.tableNumber,
      waiter: account.waiterName,
      openedAt: account.openedAt,
      status: "open",
      items,
      total: parseFloat(total.toFixed(2))
    });

  } catch (err) {
    console.error("getAccountByTable error:", err);
    return res.status(500).json({ message: "Error al consultar cuenta" });
  }
}

// RF4.2 - Generar Cuenta Total y Cerrar Mesa
export async function closeAccount(req, res) {
  try {
    const { tableNumber } = req.params;
    const { paymentMethod, cashReceived } = req.body;

    if (!tableNumber || isNaN(tableNumber)) {
      return res.status(400).json({ message: "Número de mesa inválido" });
    }

    if (!paymentMethod || !["cash", "debit_card", "credit_card"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Método de pago inválido" });
    }

    // Buscar cuenta abierta
    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("tableNumber", "==", parseInt(tableNumber))
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (accountSnapshot.empty) {
      return res.status(404).json({ message: "No hay cuenta abierta para esta mesa" });
    }

    const accountDoc = accountSnapshot.docs[0];
    const account = accountDoc.data();

    // Calcular total
    const ordersSnapshot = await db
      .collection(ORDERS)
      .where("accountId", "==", accountDoc.id)
      .where("status", "!=", "cancelled")
      .get();

    let total = 0;
    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      order.items?.forEach(item => {
        total += item.quantity * item.price;
      });
    });

    // Generar folio único
    const counterRef = db.collection("counters").doc("accounts");
    const folio = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const currentFolio = counterDoc.exists ? counterDoc.data().lastFolio : 0;
      const newFolio = currentFolio + 1;
      
      transaction.set(counterRef, { lastFolio: newFolio }, { merge: true });
      return newFolio;
    });

    // Calcular cambio si es efectivo
    let change = 0;
    if (paymentMethod === "cash" && cashReceived) {
      if (cashReceived < total) {
        return res.status(400).json({ message: "Monto recibido insuficiente" });
      }
      change = parseFloat((cashReceived - total).toFixed(2));
    }

    // Cerrar cuenta
    await accountDoc.ref.update({
      status: "closed",
      closedAt: admin.firestore.FieldValue.serverTimestamp(),
      folio,
      paymentMethod,
      total: parseFloat(total.toFixed(2)),
      cashReceived: paymentMethod === "cash" ? cashReceived : null,
      change
    });

    return res.json({
      message: "Cuenta generada correctamente",
      folio,
      total: parseFloat(total.toFixed(2)),
      paymentMethod,
      change: paymentMethod === "cash" ? change : undefined
    });

  } catch (err) {
    console.error("closeAccount error:", err);
    return res.status(500).json({ message: "Error al cerrar cuenta" });
  }
}

// RF4.3 - Consultar Historial de Cuentas
export async function getAccountHistory(req, res) {
  try {
    const { startDate, endDate, folio, tableNumber, waiterName, paymentMethod } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Las fechas son obligatorias" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validar rango de fechas
    if (start > end) {
      return res.status(400).json({ 
        message: "La fecha inicial no puede ser posterior a la fecha final" 
      });
    }

    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      return res.status(400).json({ message: "El rango de fechas no puede exceder 90 días" });
    }

    // Consulta base
    let query = db.collection(ACCOUNTS)
      .where("status", "==", "closed")
      .where("closedAt", ">=", admin.firestore.Timestamp.fromDate(start))
      .where("closedAt", "<=", admin.firestore.Timestamp.fromDate(end))
      .orderBy("closedAt", "desc");

    const snapshot = await query.get();
    let accounts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Aplicar filtros opcionales
    if (folio) {
      accounts = accounts.filter(a => a.folio === parseInt(folio));
    }
    if (tableNumber) {
      accounts = accounts.filter(a => a.tableNumber === parseInt(tableNumber));
    }
    if (waiterName) {
      accounts = accounts.filter(a => 
        a.waiterName?.toLowerCase().includes(waiterName.toLowerCase())
      );
    }
    if (paymentMethod) {
      accounts = accounts.filter(a => a.paymentMethod === paymentMethod);
    }

    const totalAmount = accounts.reduce((sum, a) => sum + (a.total || 0), 0);

    return res.json({
      message: `Se encontraron ${accounts.length} cuentas en el período seleccionado. Total: $${totalAmount.toFixed(2)}`,
      count: accounts.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      accounts: accounts.slice(0, 20) // Paginación básica
    });

  } catch (err) {
    console.error("getAccountHistory error:", err);
    return res.status(500).json({ message: "Error al consultar historial" });
  }
}

// RF4.4 - Modificar Cuenta (Antes del Cierre)
export async function modifyAccount(req, res) {
  try {
    const { tableNumber } = req.params;
    const { action, productId, quantity, reason } = req.body;

    if (!["add", "remove"].includes(action)) {
      return res.status(400).json({ message: "Acción inválida" });
    }

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Datos de producto inválidos" });
    }

    if (action === "remove" && (!reason || reason.length < 10)) {
      return res.status(400).json({ 
        message: "Debe especificar el motivo de eliminación (mínimo 10 caracteres)" 
      });
    }

    // Buscar cuenta abierta
    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("tableNumber", "==", parseInt(tableNumber))
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (accountSnapshot.empty) {
      return res.status(404).json({ message: "No se puede modificar. La cuenta ya está cerrada" });
    }

    const accountDoc = accountSnapshot.docs[0];

    // Verificar que el producto existe
    const productDoc = await db.collection(PRODUCTS).doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({ 
        message: `El producto no está disponible en el menú` 
      });
    }

    const product = productDoc.data();

    // Registrar modificación
    const modification = {
      accountId: accountDoc.id,
      action,
      productId,
      productName: product.name,
      quantity,
      price: product.price,
      reason: action === "remove" ? reason : null,
      modifiedBy: req.user?.identifier || "unknown",
      modifiedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("account_modifications").add(modification);

    const message = action === "add"
      ? `Producto agregado correctamente a la mesa ${tableNumber}`
      : `Producto eliminado correctamente de la cuenta. Motivo: ${reason}`;

    return res.json({ message });

  } catch (err) {
    console.error("modifyAccount error:", err);
    return res.status(500).json({ message: "Error al modificar cuenta" });
  }
}

// RF4.5 - Cancelar Cuenta
export async function cancelAccount(req, res) {
  try {
    const { folio } = req.params;
    const { reason, adminIdentifier, adminPassword } = req.body;

    if (!folio || isNaN(folio)) {
      return res.status(400).json({ message: "Folio inválido" });
    }

    if (!reason || reason.length < 10) {
      return res.status(400).json({ 
        message: "El motivo debe tener al menos 10 caracteres" 
      });
    }

    // Verificar autorización de administrador
    if (!adminIdentifier || !adminPassword) {
      return res.status(400).json({ message: "Se requiere autorización de administrador" });
    }

    const adminSnapshot = await db
      .collection("users")
      .where("identifier", "==", adminIdentifier)
      .where("role", "==", "administrator")
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      return res.status(403).json({ message: "Autorización incorrecta. Cancelación no realizada" });
    }

    // Buscar cuenta por folio
    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("folio", "==", parseInt(folio))
      .limit(1)
      .get();

    if (accountSnapshot.empty) {
      return res.status(404).json({ message: `El folio ${folio} no existe en el sistema` });
    }

    const accountDoc = accountSnapshot.docs[0];
    const account = accountDoc.data();

    if (account.status === "cancelled") {
      return res.status(400).json({ 
        message: `La cuenta ${folio} ya fue cancelada anteriormente` 
      });
    }

    const tableNumber = account.tableNumber;

    // Cancelar cuenta
    await accountDoc.ref.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelledBy: adminIdentifier,
      cancellationReason: reason
    });

    return res.json({
      message: `Cuenta ${folio} cancelada correctamente`,
      tableMessage: `Mesa ${tableNumber} reabierta. Los productos están nuevamente disponibles en la cuenta`
    });

  } catch (err) {
    console.error("cancelAccount error:", err);
    return res.status(500).json({ message: "Error al cancelar cuenta" });
  }
}