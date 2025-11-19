import { db, admin } from "../server/firebaseAdmin.js";

const COLLECTION = "tables";
const ORDERS_COLLECTION = "orders";
const BILLS_COLLECTION = "cuentas";

// Crear o actualizar mesa
export async function upsertTable(req, res) {
  try {
    const { tableNumber, customerName, numberOfPeople, orderId, orderData } = req.body;
    const user = req.user;

    if (!tableNumber) {
      return res.status(400).json({ message: "Número de mesa requerido" });
    }

    // Buscar si ya existe una mesa activa con ese número
    const snapshot = await db
      .collection(COLLECTION)
      .where("tableNumber", "==", tableNumber)
      .where("status", "==", "occupied")
      .get();

    const now = admin.firestore.FieldValue.serverTimestamp();

    if (!snapshot.empty) {
      // Mesa existe, actualizar agregando la nueva orden
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();
      
      const updatedOrders = [...(existingData.orders || [])];
      if (orderId && orderData) {
        updatedOrders.push({
          orderId,
          ...orderData,
          addedAt: new Date().toISOString()
        });
      }

      const newTotal = updatedOrders.reduce((sum, order) => {
        return sum + (order.total || 0);
      }, 0);

      await existingDoc.ref.update({
        orders: updatedOrders,
        total: newTotal,
        updatedAt: now,
      });

      return res.status(200).json({
        message: "Mesa actualizada correctamente",
        id: existingDoc.id,
        tableNumber,
        total: newTotal
      });
    } else {
      // Crear nueva mesa
      const orders = [];
      if (orderId && orderData) {
        orders.push({
          orderId,
          ...orderData,
          addedAt: new Date().toISOString()
        });
      }

      const total = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      const tableData = {
        tableNumber,
        customerName: customerName || "",
        numberOfPeople: numberOfPeople || 0,
        waiterId: user.identifier,
        waiterName: `${user.firstName} ${user.lastName}`,
        orders,
        total,
        status: "occupied",
        createdAt: now,
        updatedAt: now,
      };

      const ref = await db.collection(COLLECTION).add(tableData);

      return res.status(201).json({
        message: "Mesa creada correctamente",
        id: ref.id,
        ...tableData,
      });
    }
  } catch (err) {
    console.error("upsertTable error:", err);
    return res.status(500).json({ message: "Error al gestionar mesa" });
  }
}

// Listar mesas activas con sus órdenes activas
export async function listActiveTables(req, res) {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where("status", "==", "occupied")
      .get();

    const tables = [];

    // Para cada mesa, obtener sus órdenes activas
    for (const doc of snapshot.docs) {
      const tableData = { id: doc.id, ...doc.data() };

      // Buscar órdenes activas de esta mesa
      const ordersSnapshot = await db
        .collection(ORDERS_COLLECTION)
        .where("tableNumber", "==", tableData.tableNumber)
        .where("orderStatus", "==", "activo")
        .get();

      const activeOrders = ordersSnapshot.docs.map(orderDoc => ({
        id: orderDoc.id,
        ...orderDoc.data()
      }));
      
      // Ordenar órdenes por fecha de creación (más reciente primero)
      activeOrders.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      // Calcular total de órdenes activas
      const totalActiveOrders = activeOrders.reduce((sum, order) => {
        return sum + (order.total || 0);
      }, 0);

      tables.push({
        ...tableData,
        activeOrders,
        totalActiveOrders,
        activeOrdersCount: activeOrders.length
      });
    }
    
    // Ordenar mesas por fecha de creación (más reciente primero)
    tables.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return res.json(tables);
  } catch (err) {
    console.error("listActiveTables error:", err);
    return res.status(500).json({ message: "Error al listar mesas" });
  }
}

// Obtener mesa por ID con sus órdenes activas
export async function getTableById(req, res) {
  try {
    const id = req.params.id;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists)
      return res.status(404).json({ message: "Mesa no encontrada" });

    const tableData = { id: doc.id, ...doc.data() };

    // Buscar órdenes activas de esta mesa
    const ordersSnapshot = await db
      .collection(ORDERS_COLLECTION)
      .where("tableNumber", "==", tableData.tableNumber)
      .where("orderStatus", "==", "activo")
      .get();

    const activeOrders = ordersSnapshot.docs.map(orderDoc => ({
      id: orderDoc.id,
      ...orderDoc.data()
    }));
    
    // Ordenar órdenes por fecha de creación (más reciente primero)
    activeOrders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    const totalActiveOrders = activeOrders.reduce((sum, order) => {
      return sum + (order.total || 0);
    }, 0);

    return res.json({
      ...tableData,
      activeOrders,
      totalActiveOrders,
      activeOrdersCount: activeOrders.length
    });
  } catch (err) {
    console.error("getTableById error:", err);
    return res.status(500).json({ message: "Error al obtener mesa" });
  }
}

// Cerrar mesa (cambiar status a libre)
export async function closeTable(req, res) {
  try {
    const id = req.params.id;
    const { paymentMethod } = req.body;

    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Mesa no encontrada" });

    const tableData = doc.data();

    await ref.update({
      status: "libre",
      paymentMethod: paymentMethod || "cash",
      closedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ 
      message: "Mesa cerrada exitosamente",
      tableNumber: tableData.tableNumber,
      total: tableData.total
    });
  } catch (err) {
    console.error("closeTable error:", err);
    return res.status(500).json({ message: "Error al cerrar mesa" });
  }
}

// Actualizar mesa (agregar orden, actualizar info)
export async function updateTable(req, res) {
  try {
    const id = req.params.id;
    const { orderId, orderData, customerName, numberOfPeople } = req.body;

    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Mesa no encontrada" });

    const existingData = doc.data();
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Si se agrega una nueva orden
    if (orderId && orderData) {
      const updatedOrders = [...(existingData.orders || [])];
      updatedOrders.push({
        orderId,
        ...orderData,
        addedAt: new Date().toISOString()
      });

      updateData.orders = updatedOrders;
      updateData.total = updatedOrders.reduce((sum, order) => {
        return sum + (order.total || 0);
      }, 0);
    }

    // Si se actualiza info de la mesa
    if (customerName !== undefined) updateData.customerName = customerName;
    if (numberOfPeople !== undefined) updateData.numberOfPeople = numberOfPeople;

    await ref.update(updateData);

    return res.json({ message: "Mesa actualizada correctamente" });
  } catch (err) {
    console.error("updateTable error:", err);
    return res.status(500).json({ message: "Error al actualizar mesa" });
  }
}

// Generar cuenta: cierra órdenes activas y crea documento de cuenta
export async function generateBill(req, res) {
  try {
    const { tableNumber } = req.params;
    const { customerName, numberOfPeople } = req.body;

    if (!tableNumber || isNaN(tableNumber)) {
      return res.status(400).json({ message: "Número de mesa inválido" });
    }

    const tableNum = parseInt(tableNumber);

    // Buscar todas las órdenes activas de esta mesa
    const ordersSnapshot = await db
      .collection(ORDERS_COLLECTION)
      .where("tableNumber", "==", tableNum)
      .where("orderStatus", "==", "activo")
      .get();

    if (ordersSnapshot.empty) {
      return res.status(404).json({ 
        message: "No hay órdenes activas para esta mesa" 
      });
    }

    // Calcular total y recopilar información de órdenes
    let totalAmount = 0;
    const ordersList = [];

    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      totalAmount += order.total || 0;
      ordersList.push({
        orderId: doc.id,
        items: order.items,
        total: order.total,
        observations: order.observations,
        waiterName: order.waiterName,
        createdAt: order.createdAt
      });
    });

    const now = admin.firestore.FieldValue.serverTimestamp();

    // Crear documento de cuenta
    const billData = {
      tableNumber: tableNum,
      customerName: customerName || "",
      numberOfPeople: numberOfPeople || 0,
      orders: ordersList,
      totalAmount,
      closedAt: now,
      createdAt: now,
    };

    const billRef = await db.collection(BILLS_COLLECTION).add(billData);

    // Cerrar todas las órdenes activas (cambiar orderStatus a 'cerrado')
    const batch = db.batch();
    ordersSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        orderStatus: "cerrado",
        closedAt: now,
        billId: billRef.id,
        updatedAt: now
      });
    });

    await batch.commit();

    return res.status(201).json({
      message: "Cuenta generada correctamente",
      billId: billRef.id,
      tableNumber: tableNum,
      totalAmount,
      ordersCount: ordersList.length
    });
  } catch (err) {
    console.error("generateBill error:", err);
    return res.status(500).json({ message: "Error al generar cuenta" });
  }
}
