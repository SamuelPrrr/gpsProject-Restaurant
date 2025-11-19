import { db } from "../server/firebaseAdmin.js";

/**
 * Script para agregar el campo orderStatus a todas las órdenes existentes
 * que no lo tienen. Por defecto se marca como "activo".
 */
async function migrateOrderStatus() {
  try {
    console.log("Iniciando migración de orderStatus...");
    
    const ordersRef = db.collection("orders");
    const snapshot = await ordersRef.get();
    
    if (snapshot.empty) {
      console.log("No hay órdenes para migrar");
      return;
    }
    
    console.log(`Encontradas ${snapshot.size} órdenes`);
    
    const batch = db.batch();
    let count = 0;
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Solo actualizar si no tiene orderStatus
      if (!data.orderStatus) {
        batch.update(doc.ref, {
          orderStatus: "activo"
        });
        count++;
        
        // Firestore limita a 500 operaciones por batch
        if (count % 500 === 0) {
          await batch.commit();
          batchCount++;
          console.log(`Batch ${batchCount} completado (${count} órdenes actualizadas)`);
        }
      }
    }
    
    // Commit del último batch si hay operaciones pendientes
    if (count % 500 !== 0) {
      await batch.commit();
      batchCount++;
    }
    
    console.log(`Migración completada: ${count} órdenes actualizadas en ${batchCount} batch(es)`);
  } catch (error) {
    console.error("Error en migración:", error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateOrderStatus()
  .then(() => {
    console.log("Script finalizado exitosamente");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error fatal:", err);
    process.exit(1);
  });
