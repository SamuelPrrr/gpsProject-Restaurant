# Configuración de Índices de Firestore

## Opción 1: Desde la consola de Firebase (Recomendado)

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Firestore Database** > **Indexes**
4. Haz clic en **Add Index**
5. Crea los siguientes índices compuestos:

### Índice 1: Orders por tableNumber y orderStatus
- Collection: `orders`
- Fields:
  - `tableNumber` (Ascending)
  - `orderStatus` (Ascending)
  - `createdAt` (Descending)

### Índice 2: Orders por waiterId
- Collection: `orders`
- Fields:
  - `waiterId` (Ascending)
  - `createdAt` (Descending)

## Opción 2: Automática

Los índices se crearán automáticamente cuando Firestore detecte que son necesarios:

1. Inicia el backend: `npm run dev`
2. Abre el frontend y ve al tab "Mesas Activas"
3. Firestore detectará que falta un índice y te mostrará un enlace en la consola del backend
4. Haz clic en el enlace para crear el índice automáticamente

## Opción 3: Firebase CLI

Si tienes Firebase CLI instalado globalmente:

```bash
firebase deploy --only firestore:indexes
```

## Verificar

Una vez creados los índices, el tab "Mesas Activas" mostrará todas las mesas con sus órdenes activas correctamente.
