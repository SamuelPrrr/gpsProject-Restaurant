import { db } from "../server/firebaseAdmin.js";

/**
 * Script para actualizar las categorías de productos
 * Cambia "Comidas" a "Platos Fuertes" y estandariza nombres de categorías
 */
async function updateProductCategories() {
  try {
    console.log("🔄 Iniciando actualización de categorías de productos...");

    // Mapeo de categorías antiguas a nuevas
    const categoryMapping = {
      "Comidas": "Platos Fuertes",
      "comidas": "Platos Fuertes",
      "bebidas": "Bebidas",
      "postres": "Postres",
      "entradas": "Entradas",
      "ensaladas": "Ensaladas",
      "sopas": "Sopas",
      "platos_fuertes": "Platos Fuertes",
      "Platos fuertes": "Platos Fuertes"
    };

    const productsSnapshot = await db.collection("products").get();
    
    if (productsSnapshot.empty) {
      console.log("⚠️  No se encontraron productos para actualizar");
      return;
    }

    const batch = db.batch();
    let updatedCount = 0;

    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      const oldCategory = product.category;
      
      // Si la categoría está en el mapeo, actualizarla
      if (categoryMapping[oldCategory]) {
        const newCategory = categoryMapping[oldCategory];
        
        if (oldCategory !== newCategory) {
          batch.update(doc.ref, { category: newCategory });
          console.log(`  📝 ${doc.id}: "${oldCategory}" → "${newCategory}"`);
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Se actualizaron ${updatedCount} productos correctamente`);
    } else {
      console.log("✅ Todos los productos ya tienen las categorías correctas");
    }

  } catch (error) {
    console.error("❌ Error al actualizar categorías:", error);
    throw error;
  }
}

// Ejecutar el script si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateProductCategories()
    .then(() => {
      console.log("\n✨ Script completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error al ejecutar el script:", error);
      process.exit(1);
    });
}

export { updateProductCategories };
