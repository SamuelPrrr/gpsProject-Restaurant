import { db, admin } from "../server/firebaseAdmin.js";

const COLLECTION = "orders";
const TABLES_COLLECTION = "tables";

// RF3.1 
export async function createOrder(req, res) {
  try {
    const { tableNumber, items, observations, customerName, numberOfPeople } = req.body;
    const user = req.user;
    
    console.log('createOrder - user:', JSON.stringify(user, null, 2));
    console.log('createOrder - body:', { tableNumber, customerName, numberOfPeople, itemsCount: items?.length });

    if (!tableNumber || !items?.length) {
      return res.status(400).json({ message: "Faltan datos del pedido" });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const now = admin.firestore.FieldValue.serverTimestamp();

    const order = {
      tableNumber,
      customerName: customerName || "",
      numberOfPeople: numberOfPeople || 0,
      waiterId: user.id || user.identifier,
      waiterName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Mesero',
      items,
      observations: observations || "",
      total,
      status: "new",
      orderStatus: "activo",
      createdAt: now,
      updatedAt: now,
    };

    // Crear la orden
    const ref = await db.collection(COLLECTION).add(order);
    console.log('Orden creada con ID:', ref.id);

    // Buscar si ya existe una mesa activa con ese número
    console.log('Buscando mesa existente con número:', tableNumber);
    const tableSnapshot = await db
      .collection(TABLES_COLLECTION)
      .where("tableNumber", "==", tableNumber)
      .where("status", "==", "occupied")
      .get();

    if (!tableSnapshot.empty) {
      // Mesa existe, actualizar agregando la nueva orden
      console.log('Mesa existente encontrada, actualizando...');
      const existingDoc = tableSnapshot.docs[0];
      const existingData = existingDoc.data();
      
      const updatedOrders = [...(existingData.orders || [])];
      // No incluir serverTimestamp en el array
      const orderForArray = {
        orderId: ref.id,
        tableNumber: order.tableNumber,
        waiterId: order.waiterId,
        waiterName: order.waiterName,
        items: order.items,
        observations: order.observations,
        total: order.total,
        status: order.status,
        orderStatus: order.orderStatus,
        addedAt: new Date().toISOString()
      };
      updatedOrders.push(orderForArray);

      const newTotal = updatedOrders.reduce((sum, o) => {
        return sum + (o.total || 0);
      }, 0);

      await existingDoc.ref.update({
        orders: updatedOrders,
        total: newTotal,
        updatedAt: now,
      });
      console.log('Mesa actualizada correctamente');
    } else {
      // Crear nueva mesa
      console.log('No existe mesa, creando nueva...');
      // No incluir serverTimestamp en el array de orders
      const orderForArray = {
        orderId: ref.id,
        tableNumber: order.tableNumber,
        waiterId: order.waiterId,
        waiterName: order.waiterName,
        items: order.items,
        observations: order.observations,
        total: order.total,
        status: order.status,
        orderStatus: order.orderStatus,
        addedAt: new Date().toISOString()
      };
      
      const tableData = {
        tableNumber,
        customerName: customerName || "",
        numberOfPeople: numberOfPeople || 0,
        waiterId: user.id || user.identifier,
        waiterName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Mesero',
        orders: [orderForArray],
        total,
        status: "occupied",
        createdAt: now,
        updatedAt: now,
      };

      await db.collection(TABLES_COLLECTION).add(tableData);
      console.log('Nueva mesa creada correctamente');
    }

    console.log('Orden completada exitosamente');
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
    const { tableNumber, orderStatus } = req.query;
    
    // Construir query sin orderBy para evitar índices compuestos
    let query = db.collection(COLLECTION);

    // Si hay usuario autenticado y es mesero, filtrar solo sus órdenes
    if (user && user.role === "waiter") {
      query = query.where("waiterId", "==", user.identifier);
    }

    // Filtrar por mesa si se proporciona
    if (tableNumber) {
      query = query.where("tableNumber", "==", parseInt(tableNumber));
    }

    // Filtrar por estado de orden si se proporciona
    if (orderStatus) {
      query = query.where("orderStatus", "==", orderStatus);
    }

    const snapshot = await query.get();
    let orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Ordenar en memoria en lugar de en la query
    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA; // Descendente
    });

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
