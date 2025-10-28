import { db, admin } from "../services/firebaseAdmin.js";

const COLLECTION = "products";

// RF2.2 
export async function listProducts(req, res) {
  try {
    const { category, available } = req.query;
    
    let query = db.collection(COLLECTION);
  
    if (category) {
      query = query.where("category", "==", category);
    }
    
    if (available !== undefined) {
      const isAvailable = available === "true";
      query = query.where("available", "==", isAvailable);
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({ 
        message: "No hay productos registrados en el sistema",
        products: [] 
      });
    }
    
    const products = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return res.json(products);
  } catch (err) {
    console.error("listProducts error:", err);
    return res.status(500).json({ message: "Error al listar productos" });
  }
}


export async function getProductById(req, res) {
  try {
    const id = req.params.id;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ message: "Error al obtener producto" });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, description, price, category, available, imageUrl } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios (name, description, price, category)" 
      });
    }

  
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ 
        message: "El precio debe ser un número válido mayor o igual a 0" 
      });
    }
    if (description.length > 300) {
      return res.status(400).json({ 
        message: "La descripción no debe exceder 500 caracteres" 
      });
    }


    const dupSnapshot = await db
      .collection(COLLECTION)
      .where("name", "==", name)
      .where("category", "==", category)
      .limit(1)
      .get();

    if (!dupSnapshot.empty) {
      return res.status(409).json({ 
        message: "Error: Producto ya registrado en esta categoría" 
      });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    const docData = {
      name,
      description,
      price: parseFloat(priceNum.toFixed(2)), 
      category,
      available: available !== undefined ? available : true,
      imageUrl: imageUrl || "",
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(COLLECTION).add(docData);

    return res.status(201).json({
      id: ref.id,
      message: "Producto agregado al menú correctamente",
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ message: "Error al crear producto" });
  }
}

// RF2.3 
export async function updateProduct(req, res) {
  try {
    const id = req.params.id;
    const changes = req.body;

    const productRef = db.collection(COLLECTION).doc(id);
    const snap = await productRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const currentProduct = snap.data();

    if (changes.name && changes.name !== currentProduct.name) {
      const categoryToCheck = changes.category || currentProduct.category;
      
      const dupSnapshot = await db
        .collection(COLLECTION)
        .where("name", "==", changes.name)
        .where("category", "==", categoryToCheck)
        .limit(1)
        .get();

      if (!dupSnapshot.empty) {
        return res.status(409).json({ 
          message: "Error: Ya existe un producto con ese nombre en esta categoría" 
        });
      }
    }

    if (changes.description && changes.description.length > 500) {
      return res.status(400).json({ 
        message: "La descripción no debe exceder 500 caracteres" 
      });
    }

    const updateDoc = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (changes.name) updateDoc.name = changes.name;
    if (changes.description !== undefined) updateDoc.description = changes.description;
    if (changes.price !== undefined) {
      const priceNum = parseFloat(changes.price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ 
          message: "El precio debe ser un número válido mayor o igual a 0" 
        });
      }
      updateDoc.price = parseFloat(priceNum.toFixed(2));
    }
    if (changes.category) updateDoc.category = changes.category;
    if (changes.imageUrl !== undefined) updateDoc.imageUrl = changes.imageUrl;
    if (changes.available !== undefined) updateDoc.available = changes.available;

    await productRef.update(updateDoc);

    return res.json({ message: "Producto actualizado correctamente" });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ message: "Error al actualizar producto" });
  }
}

// RF2.4 
export async function deleteProduct(req, res) {
  try {
    const id = req.params.id;
    const productRef = db.collection(COLLECTION).doc(id);
    const snap = await productRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    await productRef.delete();

    return res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ message: "Error al eliminar producto" });
  }
}


export async function searchProductsByName(req, res) {
  try {
    const term = req.params.term.toLowerCase();
    const snapshot = await db.collection(COLLECTION).get();

    if (snapshot.empty) {
      return res.json({ 
        message: "No hay productos registrados",
        products: [] 
      });
    }

    const results = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.name?.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json(results);
  } catch (err) {
    console.error("searchProductsByName error:", err);
    return res.status(500).json({ message: "Error al buscar productos" });
  }
}


export async function filterProductsByCategory(req, res) {
  try {
    const category = req.params.category;
    const snapshot = await db
      .collection(COLLECTION)
      .where("category", "==", category)
      .get();

    if (snapshot.empty) {
      return res.json({ 
        message: `No hay productos en la categoría ${category}`,
        products: [] 
      });
    }

    const results = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json(results);
  } catch (err) {
    console.error("filterProductsByCategory error:", err);
    return res.status(500).json({ message: "Error al filtrar productos" });
  }
}