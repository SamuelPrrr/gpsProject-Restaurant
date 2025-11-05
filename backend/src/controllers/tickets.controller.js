import { db } from "../server/firebaseAdmin.js";

const ACCOUNTS = "accounts";

// RF6.1 
export async function generateTicket(req, res) {
  try {
    const { folio } = req.params;

    if (!folio || isNaN(folio)) {
      return res.status(400).json({ message: "Folio inválido" });
    }

    const accountSnapshot = await db
      .collection(ACCOUNTS)
      .where("folio", "==", parseInt(folio))
      .limit(1)
      .get();

    if (accountSnapshot.empty) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    const account = accountSnapshot.docs[0].data();

    // Estructura del ticket
    const ticket = {
      restaurant: "El Alevin",
      address: "Dirección del restaurante",
      folio: account.folio,
      date: account.closedAt?.toDate().toLocaleDateString() || "",
      time: account.closedAt?.toDate().toLocaleTimeString() || "",
      waiter: account.waiterName,
      table: account.tableNumber,
      items: account.items || [],
      subtotal: account.total || 0,
      total: account.total || 0,
      paymentMethod: account.paymentMethod,
      cashReceived: account.cashReceived || null,
      change: account.change || null
    };
    
    return res.json({
      message: "Cuenta guardada correctamente. Impresora no disponible",
      ticket,
      note: "Funcionalidad de impresión física opcional - requiere impresora térmica configurada"
    });

  } catch (err) {
    console.error("generateTicket error:", err);
    return res.status(500).json({ 
      message: "Error en la impresora. Cuenta guardada correctamente" 
    });
  }
}