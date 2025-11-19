# Cambios en el Sistema de Órdenes y Cuentas

## Resumen
Se implementaron cambios para agregar estados a las órdenes (activo/cerrado) y un sistema de generación de cuentas que cierra las órdenes activas de una mesa.

## Cambios Realizados

### 1. Campo `orderStatus` en Órdenes
- **Archivo**: `src/controllers/orders.controller.js`
- Se agregó el campo `orderStatus` al crear una orden
- Valores posibles: `"activo"` o `"cerrado"`
- Por defecto: `"activo"`

### 2. Filtros en Listado de Órdenes
- **Archivo**: `src/controllers/orders.controller.js`
- La función `listOrders` ahora acepta query parameters:
  - `tableNumber`: Filtra órdenes por número de mesa
  - `orderStatus`: Filtra órdenes por estado ("activo" o "cerrado")
- **Ejemplo de uso**: 
  - `GET /api/orders?tableNumber=5&orderStatus=activo` - Lista todas las órdenes activas de la mesa 5

### 3. Nueva Función `generateBill`
- **Archivo**: `src/controllers/tables.controller.js`
- Busca todas las órdenes activas de una mesa
- Calcula el total sumando todas las órdenes
- Crea un nuevo documento en la colección `"cuentas"` con:
  - `tableNumber`: Número de mesa
  - `customerName`: Nombre del cliente
  - `numberOfPeople`: Número de personas
  - `orders`: Array con todas las órdenes incluidas
  - `totalAmount`: Monto total
  - `closedAt`: Timestamp de cierre
  - `createdAt`: Timestamp de creación
- Cambia el `orderStatus` de todas las órdenes de `"activo"` a `"cerrado"`
- Agrega referencia `billId` en cada orden cerrada

### 4. Modificación en Listado de Mesas Activas
- **Archivo**: `src/controllers/tables.controller.js`
- Las funciones `listActiveTables` y `getTableById` ahora incluyen:
  - `activeOrders`: Array con todas las órdenes activas de la mesa
  - `totalActiveOrders`: Suma total de todas las órdenes activas
  - `activeOrdersCount`: Cantidad de órdenes activas
- **Endpoint**: `GET /api/tables` - Ahora devuelve cada mesa con sus órdenes activas incluidas

### 5. Nuevo Endpoint para Generar Cuenta
- **Ruta**: `POST /api/tables/:tableNumber/generate-bill`
- **Archivo**: `src/routes/tables.routes.js`
- **Autenticación**: Requiere `adminAuth`
- **Body (opcional)**:
  ```json
  {
    "customerName": "Nombre del cliente",
    "numberOfPeople": 4
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "message": "Cuenta generada correctamente",
    "billId": "abc123",
    "tableNumber": 5,
    "totalAmount": 350.50,
    "ordersCount": 3
  }
  ```

## Estructura de Datos

### Orden (modificada)
```javascript
{
  tableNumber: 5,
  waiterId: "waiter123",
  waiterName: "Juan Pérez",
  items: [...],
  observations: "Sin cebolla",
  total: 150.50,
  status: "new",           // Estado de cocina
  orderStatus: "activo",   // NUEVO: Estado de la orden
  createdAt: Timestamp,
  updatedAt: Timestamp,
  // Cuando se cierra:
  closedAt: Timestamp,
  billId: "bill123"
}
```

### Cuenta (nueva colección "cuentas")
```javascript
{
  tableNumber: 5,
  customerName: "María López",
  numberOfPeople: 4,
  orders: [
    {
      orderId: "order1",
      items: [...],
      total: 150.50,
      observations: "",
      waiterName: "Juan Pérez",
      createdAt: Timestamp
    },
    {
      orderId: "order2",
      items: [...],
      total: 200.00,
      observations: "",
      waiterName: "Juan Pérez",
      createdAt: Timestamp
    }
  ],
  totalAmount: 350.50,
  closedAt: Timestamp,
  createdAt: Timestamp
}
```

## Flujo de Uso

1. **Crear órdenes**: Las órdenes se crean con `orderStatus: "activo"`
2. **Ver mesas activas**: `GET /api/tables` - Devuelve todas las mesas con sus órdenes activas incluidas
3. **Listar órdenes activas por mesa** (alternativa): `GET /api/orders?tableNumber=5&orderStatus=activo`
4. **Generar cuenta**: `POST /api/tables/5/generate-bill`
   - Esto cierra todas las órdenes activas
   - Crea un documento de cuenta en la colección "cuentas"
   - Las órdenes cambian a `orderStatus: "cerrado"`

## Respuesta de Mesas Activas

Cuando consultas `GET /api/tables`, cada mesa incluye:

```json
{
  "id": "mesa123",
  "tableNumber": 5,
  "status": "occupied",
  "customerName": "María López",
  "numberOfPeople": 4,
  "waiterId": "waiter123",
  "waiterName": "Juan Pérez",
  "createdAt": "...",
  "updatedAt": "...",
  "activeOrders": [
    {
      "id": "order1",
      "tableNumber": 5,
      "items": [...],
      "total": 150.50,
      "status": "new",
      "orderStatus": "activo",
      "createdAt": "..."
    },
    {
      "id": "order2",
      "tableNumber": 5,
      "items": [...],
      "total": 200.00,
      "status": "ready",
      "orderStatus": "activo",
      "createdAt": "..."
    }
  ],
  "totalActiveOrders": 350.50,
  "activeOrdersCount": 2
}
```

## Pasos de Migración

### 1. Actualizar índices de Firestore
Se agregaron nuevos índices en `firestore.indexes.json`. Para aplicarlos:

```bash
firebase deploy --only firestore:indexes
```

### 2. Migrar órdenes existentes
Ejecutar el script de migración para agregar `orderStatus` a órdenes existentes:

```bash
cd backend
node src/scripts/migrateOrderStatus.js
```

### 3. Reiniciar el backend
Reiniciar el servidor backend para aplicar los cambios:

```bash
cd backend
npm run dev
```

## Notas Importantes

- Las órdenes con `orderStatus: "cerrado"` quedan vinculadas a su cuenta mediante el campo `billId`
- El tab de mesas muestra automáticamente todas las órdenes activas de cada mesa mediante `GET /api/tables`
- Las cuentas generadas quedan registradas en la colección "cuentas" para historial
- `totalActiveOrders` suma solo las órdenes activas, no incluye las ya cerradas
- Si una mesa no tiene órdenes activas, no aparecerá en el listado de mesas activas (aunque tenga status "occupied")
