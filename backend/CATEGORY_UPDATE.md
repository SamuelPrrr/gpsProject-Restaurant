# Actualización de Categorías de Productos

## 📋 Cambios Realizados

Se han estandarizado las categorías de productos en el sistema:

### Categorías Actualizadas

| Categoría Antigua | Categoría Nueva |
|-------------------|-----------------|
| `Comidas` | `Platos Fuertes` |
| `comidas` | `Platos Fuertes` |
| `bebidas` | `Bebidas` |
| `postres` | `Postres` |
| `platos_fuertes` | `Platos Fuertes` |

### Nuevas Categorías Disponibles

- ✅ **Bebidas**
- ✅ **Entradas**
- ✅ **Platos Fuertes**
- ✅ **Postres**
- ✅ **Ensaladas**
- ✅ **Sopas**

## 🚀 Ejecución Automática

El script de actualización se ejecuta automáticamente cuando inicias el servidor:

```bash
cd backend
npm run dev
```

El servidor ejecutará:
1. Inicialización del admin
2. Inicialización de productos base
3. **Actualización de categorías** ← Nuevo

## 🔧 Ejecución Manual

Si necesitas actualizar las categorías manualmente, ejecuta:

```bash
cd backend
node update-categories.js
```

## 📝 Archivos Modificados

### Backend
- `src/scripts/updateProductCategories.js` - Script de actualización
- `src/init/initProducts.js` - Productos iniciales actualizados
- `src/server.js` - Integración del script
- `update-categories.js` - Script ejecutable manual

### Frontend
- `src/components/Admin/ProductModal.jsx` - Dropdown de categorías actualizado

## 🎯 Impacto

### En Admin
- Al crear o editar productos, las categorías ahora muestran:
  - "Platos Fuertes" (en lugar de "Comidas")
  - Formato capitalizado consistente

### En Meseros
- Las categorías se muestran automáticamente desde el backend
- La categoría "Platos Fuertes" aparecerá correctamente en los filtros

### Base de Datos
- Todos los productos existentes con `category: "Comidas"` ahora tienen `category: "Platos Fuertes"`
- Las categorías se estandarizan con capitalización correcta

## ✅ Verificación

Para verificar que la actualización funcionó:

1. Inicia el servidor y revisa los logs:
   ```
   🔄 Iniciando actualización de categorías de productos...
   📝 [ID]: "Comidas" → "Platos Fuertes"
   ✅ Se actualizaron X productos correctamente
   ```

2. En Admin, ve a la sección de Productos y verifica que las categorías sean correctas

3. En Meseros, verifica que aparezca "Platos Fuertes" en los filtros

## 🔄 Migración Segura

El script:
- ✅ No elimina productos
- ✅ Solo actualiza la propiedad `category`
- ✅ Es idempotente (puede ejecutarse múltiples veces sin problemas)
- ✅ Muestra un log detallado de los cambios

## 🐛 Solución de Problemas

### Las categorías no se actualizaron

1. Verifica que el servidor haya iniciado correctamente
2. Revisa los logs del servidor para ver si hubo errores
3. Ejecuta manualmente el script: `node update-categories.js`

### Aparecen categorías antiguas

1. Reinicia el servidor
2. Limpia el caché del navegador
3. Verifica que no haya errores en la consola del backend
