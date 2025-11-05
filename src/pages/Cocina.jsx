import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChefHat, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

// Main Kitchen Panel Component
const Cocina = () => {
  // --- Configuration ---
  // Toggle this to true to simulate intermittent connection issues for demo purposes.
  const SIMULATE_CONNECTION_ISSUE = false;

  // Initial demo orders (timestamps ensure chronological ordering)
  const [orders, setOrders] = useState([
    {
      id: "001",
      mesa: 5,
      mesero: "Maria",
      cliente: "Juan Pérez",
      productos: [
        { nombre: "Mojarra Frita Chica", cantidad: 1 },
        { nombre: "Mojarra a la Diabla Mediana", cantidad: 2 },
        { nombre: "Coca Cola", cantidad: 2 },
      ],
      estado: "pendiente", // 'pendiente' maps to 'Nuevo'
      timestamp: Date.now() - 1000 * 60 * 15, // 15 min ago
      observaciones: "",
    },
    {
      id: "002",
      mesa: 3,
      mesero: "Carlos",
      cliente: "Ana García",
      productos: [
        { nombre: "Caldo Alevin", cantidad: 1 },
        { nombre: "Mojarra Frita Chica", cantidad: 1 },
        { nombre: "Agua Mineral", cantidad: 2 },
      ],
      estado: "preparando",
      timestamp: Date.now() - 1000 * 60 * 10, // 10 min ago
      observaciones: "",
    },
    {
      id: "003",
      mesa: 7,
      mesero: "Luis",
      cliente: "Julian García",
      productos: [
        {
          nombre: "Mojarra Empapelada Chica",
          cantidad: 1,
          observaciones: "sin Epazote",
        },
        { nombre: "Orden de Papas a la Francesa", cantidad: 1 },
      ],
      estado: "listo",
      timestamp: Date.now() - 1000 * 60 * 5, // 5 min ago
      observaciones: "La Mojarra empapelada sin Epazote",
    },
  ]);

  // Active order selection for modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // History (state changes and cancellations)
  const [history, setHistory] = useState([]);

  // Notifications / banners
  const [banner, setBanner] = useState(null); // { type: 'info'|'error'|'success', text }

  // Connection simulation / status
  const [connected, setConnected] = useState(true);
  const connRef = useRef({ lastStatus: true });

  // Force re-render to update elapsed times
  const [, setTick] = useState(0);

  // --- Helpers ---
  const getElapsedTime = (timestamp) => {
    const elapsedMinutes = Math.floor((Date.now() - timestamp) / 60000);
    if (elapsedMinutes < 1) return "Ahora";
    if (elapsedMinutes === 1) return "1 min";
    return `${elapsedMinutes} min`;
  };

  const showNotification = (text, type = "info") => {
    setBanner({ text, type });
    setTimeout(() => {
      setBanner(null);
    }, 4000);
  };

  // Simulate a persistent real-time connection (websocket/heartbeat)
  useEffect(() => {
    // tick for elapsed times
    const tickInt = setInterval(() => setTick((t) => t + 1), 10000); // update every 10s

    // Simulate connection health checks every 25s
    const connInt = setInterval(() => {
      if (!SIMULATE_CONNECTION_ISSUE) {
        if (!connected && connRef.current.lastStatus === false) {
          // ensure banner cleared and marked as reconnected
          setConnected(true);
          connRef.current.lastStatus = true;
          showNotification(
            "Conexión restablecida correctamente",
            "success"
          );
        }
        return;
      }

      // Randomly simulate a short disconnect
      const fail = Math.random() < 0.06;
      if (fail) {
        setConnected(false);
        connRef.current.lastStatus = false;
        showNotification(
          "Fallo en la sincronización con cocina. Reconectando...",
          "error"
        );
        // restore after a short delay
        setTimeout(() => {
          setConnected(true);
          connRef.current.lastStatus = true;
          showNotification(
            "Conexión restablecida correctamente",
            "success"
          );
        }, 3000);
      }
    }, 25000);

    return () => {
      clearInterval(tickInt);
      clearInterval(connInt);
    };
  }, [connected]);

  // Group orders by estado and sort oldest first (chronological)
  const grouped = {
    pendiente: orders
      .filter((o) => o.estado === "pendiente")
      .sort((a, b) => a.timestamp - b.timestamp),
    preparando: orders
      .filter((o) => o.estado === "preparando")
      .sort((a, b) => a.timestamp - b.timestamp),
    listo: orders
      .filter((o) => o.estado === "listo")
      .sort((a, b) => a.timestamp - b.timestamp),
  };

  // Business-rule: only allow cambio to 'preparando' from 'pendiente'
  const marcarEnPreparacion = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      showNotification(
        `El pedido ${orderId} no existe en el sistema`,
        "error"
      );
      return;
    }
    if (order.estado !== "pendiente") {
      showNotification(`El pedido ${orderId} ya fue procesado`, "error");
      return;
    }
    if (!connected) {
      showNotification(
        "No se pudo actualizar el estado. Verifique la conexión",
        "error"
      );
      return;
    }

    const user = sessionStorage.getItem("userName") || "Cocina";
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, estado: "preparando", timestamp: Date.now() }
          : o
      )
    );
    setHistory((h) => [
      {
        id: orderId,
        from: "pendiente",
        to: "preparando",
        user,
        when: Date.now(),
      },
      ...h,
    ]);
    showNotification(
      `Pedido ${orderId} marcado como en preparación`,
      "success"
    );
    // simulate notifying mesero
    console.log(
      `Notificar mesero ${order.mesero}: Pedido ${orderId} en preparación`
    );
  };

  const marcarListo = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      showNotification(
        `El pedido ${orderId} no existe en el sistema`,
        "error"
      );
      return;
    }
    if (order.estado !== "preparando") {
      showNotification(
        `El pedido ${orderId} no está en preparación`,
        "error"
      );
      return;
    }
    if (!connected) {
      showNotification(
        "No se pudo actualizar el estado. Verifique la conexión",
        "error"
      );
      return;
    }

    const user = sessionStorage.getItem("userName") || "Cocina";
    // record total preparation time
    const timeInPreparation = Date.now() - order.timestamp;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              estado: "listo",
              timestamp: Date.now(),
              prepTime: timeInPreparation,
            }
          : o
      )
    );
    setHistory((h) => [
      {
        id: orderId,
        from: "preparando",
        to: "listo",
        user,
        when: Date.now(),
        prepTime: timeInPreparation,
      },
      ...h,
    ]);
    showNotification(
      `Pedido ${orderId} marcado como listo para servir`,
      "success"
    );
    console.log(
      `Notificar mesero ${order.mesero}: Pedido ${orderId} listo para servir`
    );
  };

  const confirmarCancelacion = () => {
    if (!selectedOrder) return;
    if (!cancelReason || cancelReason.trim().length < 5) {
      showNotification(
        "El ingrediente faltante debe tener al menos 5 caracteres",
        "error"
      );
      return;
    }
    if (!connected) {
      showNotification(
        "No se pudo cancelar el pedido. Verifique la conexión e intente nuevamente",
        "error"
      );
      return;
    }

    const orderId = selectedOrder.id;
    const user = sessionStorage.getItem("userName") || "Cocina";
    // remove from active orders
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    // add to history as canceled
    setHistory((h) => [
      {
        id: orderId,
        action: "cancelado",
        user,
        when: Date.now(),
        ingredient: cancelReason,
      },
      ...h,
    ]);
    showNotification(
      `Pedido ${orderId} cancelado correctamente por falta de ingrediente`,
      "success"
    );
    console.log(
      `Notificar mesero ${selectedOrder.mesero}: Pedido ${orderId} - Mesa ${selectedOrder.mesa} cancelado por cocina. Ingrediente faltante: ${cancelReason}`
    );

    setShowCancelModal(false);
    setCancelReason("");
    setSelectedOrder(null);
  };

  return (
    <div className='min-h-screen bg-white p-6'>
      {/* Back button to return to previous view */}
      <div className='mb-3'>
        <BackButton
          onClick={() => window.history.back()}
          label='Regresar'
        />
      </div>
      {/* Header */}
      <div className='bg-white rounded-2xl shadow-2xl border-0 backdrop-blur-sm bg-white/90 mb-6 overflow-hidden'>
        <div className='h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600'></div>
        <div className='p-5 flex justify-between items-center'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300'>
              <ChefHat className='w-6 h-6 text-white' strokeWidth={2.5} />
            </div>
            <div>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
                Panel de Cocina
              </h2>
              <div className='text-sm text-gray-600'>
                Gestión de pedidos - Módulo 5
              </div>
            </div>
          </div>

          <div className='flex gap-3 items-center'>
            <div className='text-sm text-gray-600'>Conexión:</div>
            <div className={`px-4 py-2 rounded-lg font-medium ${
              connected 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {connected ? "Conectado" : "Reconectando..."}
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`mb-4 p-3 px-4 rounded-lg border ${
          banner.type === "error"
            ? "bg-red-50 text-red-800 border-red-200"
            : banner.type === "success"
            ? "bg-green-50 text-green-800 border-green-200"
            : "bg-blue-50 text-blue-800 border-blue-200"
        }`}>
          {banner.text}
        </div>
      )}

      {/* Counts / Sections */}
      <div className='flex gap-3 mb-4'>
        <div className='bg-red-50 px-4 py-2 rounded-lg text-red-800 font-bold shadow-sm border border-red-100'>
          Nuevo: {grouped.pendiente.length}
        </div>
        <div className='bg-yellow-50 px-4 py-2 rounded-lg text-yellow-800 font-bold shadow-sm border border-yellow-100'>
          En Preparación: {grouped.preparando.length}
        </div>
        <div className='bg-green-50 px-4 py-2 rounded-lg text-green-800 font-bold shadow-sm border border-green-100'>
          Listo: {grouped.listo.length}
        </div>
      </div>

      {/* Sections Grid */}
      {orders.length === 0 ? (
        <div className='bg-white rounded-2xl p-12 text-center shadow-xl'>
          <ChefHat
            size={64}
            className='mx-auto mb-4 text-orange-200'
          />
          <h3 className='text-xl font-bold text-gray-800 mb-2'>
            No hay órdenes en cocina
          </h3>
          <p className='text-sm text-gray-600'>
            No hay pedidos
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-4'>
          {/* Nuevo */}
          <div>
            <h4 className='mt-0 mb-3 text-lg font-bold text-orange-600'>Nuevo</h4>
            <div className='flex flex-col gap-3'>
              {grouped.pendiente.map((order) => (
                <div
                  key={order.id}
                  className='bg-white rounded-xl p-4 shadow-lg border-l-4 border-red-300 hover:shadow-xl transition-shadow duration-200'
                >
                  <div className='flex justify-between items-center'>
                    <div>
                      <div className='text-sm text-gray-700 font-bold'>
                        Mesa {order.mesa} — {order.cliente}
                      </div>
                      <div className='text-xs text-gray-500'>
                        Pedido #{order.id} • {getElapsedTime(order.timestamp)}
                      </div>
                    </div>
                    <div className='text-right'>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelModal(true);
                        }}
                        className='bg-transparent border-none text-red-500 hover:text-red-700 cursor-pointer transition-colors'
                        title='Cancelar pedido'
                      >
                        <XCircle />
                      </button>
                    </div>
                  </div>

                  <div className='mt-3 bg-gray-50 p-3 rounded-lg'>
                    {order.productos.map((p, i) => (
                      <div
                        key={i}
                        className={`flex justify-between py-2 ${
                          i < order.productos.length - 1 ? 'border-b border-dashed border-gray-200' : ''
                        }`}
                      >
                        <div className='text-sm'>
                          {p.cantidad}x {p.nombre}
                        </div>
                        {p.observaciones && (
                          <div className='text-xs text-gray-800 bg-yellow-100 px-2 py-1 rounded-md'>
                            {p.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.observaciones && (
                    <div className='mt-3 bg-yellow-100 p-2 rounded-lg text-yellow-800 text-sm'>
                      <strong>Nota:</strong> {order.observaciones}
                    </div>
                  )}

                  <div className='flex gap-2 mt-3'>
                    <button
                      onClick={() => marcarEnPreparacion(order.id)}
                      className='flex-1 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold border-none cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
                    >
                      Comenzar Preparación
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* En Preparación */}
          <div>
            <h4 className='mt-0 mb-3 text-lg font-bold text-gray-800'>
              En Preparación
            </h4>
            <div className='flex flex-col gap-3'>
              {grouped.preparando.map((order) => (
                <div
                  key={order.id}
                  className='bg-white rounded-xl p-4 shadow-lg border-l-4 border-yellow-300 hover:shadow-xl transition-shadow duration-200'
                >
                  <div className='flex justify-between items-center'>
                    <div>
                      <div className='text-sm text-gray-800 font-bold'>
                        {order.cliente} — Mesa {order.mesa}
                      </div>
                      <div className='text-xs text-gray-600'>
                        Pedido #{order.id} • {getElapsedTime(order.timestamp)}
                      </div>
                    </div>
                    <div className='text-xs text-gray-600'>
                      Mesero: {order.mesero}
                    </div>
                  </div>

                  <div className='mt-3 bg-gray-50 p-3 rounded-lg'>
                    {order.productos.map((p, i) => (
                      <div
                        key={i}
                        className={`flex justify-between py-2 ${
                          i < order.productos.length - 1 ? 'border-b border-dashed border-gray-200' : ''
                        }`}
                      >
                        <div className='text-sm'>
                          {p.cantidad}x {p.nombre}
                        </div>
                        {p.observaciones && (
                          <div className='text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded-md'>
                            {p.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className='flex gap-2 mt-3'>
                    <button
                      onClick={() => marcarListo(order.id)}
                      className='flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold border-none cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
                    >
                      Marcar como Listo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Listo */}
          <div>
            <h4 className='mt-0 mb-3 text-lg font-bold text-gray-800'>Listo</h4>
            <div className='flex flex-col gap-3'>
              {grouped.listo.map((order) => (
                <div
                  key={order.id}
                  className='bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-300 hover:shadow-xl transition-shadow duration-200'
                >
                  <div className='flex justify-between items-center'>
                    <div>
                      <div className='text-sm text-gray-800 font-bold'>
                        Mesa {order.mesa} — {order.cliente}
                      </div>
                      <div className='text-xs text-gray-600'>
                        Pedido #{order.id} • {getElapsedTime(order.timestamp)}
                      </div>
                    </div>
                    <div className='text-xs text-gray-600'>
                      Mesero: {order.mesero}
                    </div>
                  </div>

                  <div className='mt-3 bg-gray-50 p-3 rounded-lg'>
                    {order.productos.map((p, i) => (
                      <div
                        key={i}
                        className={`flex justify-between py-2 ${
                          i < order.productos.length - 1 ? 'border-b border-dashed border-gray-200' : ''
                        }`}
                      >
                        <div className='text-sm'>
                          {p.cantidad}x {p.nombre}
                        </div>
                        {p.observaciones && (
                          <div className='text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded-md'>
                            {p.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className='mt-3 text-sm text-gray-600'>
                    Tiempo total preparación:{" "}
                    {order.prepTime
                      ? Math.ceil(order.prepTime / 60000) + " min"
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedOrder && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl'>
            <h3 className='text-xl font-bold text-gray-800 mb-2'>
              Cancelar Pedido {selectedOrder.id}
            </h3>
            <p className='text-gray-600 mb-4'>
              Mesa {selectedOrder.mesa} - {selectedOrder.cliente}
            </p>

            <div className='mb-3'>
              <label className='block font-bold mb-2 text-gray-700'>
                Ingrediente faltante *
              </label>
              <input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder='Ej: Mojarra fresca'
                className='w-full p-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all'
              />
            </div>

            <div className='bg-yellow-100 p-3 rounded-lg mb-4 text-yellow-800 text-sm'>
              <strong>Advertencia:</strong> Esta acción notificará
              inmediatamente al mesero {selectedOrder.mesero}
            </div>

            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedOrder(null);
                }}
                className='flex-1 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors'
              >
                Volver
              </button>
              <button
                onClick={confirmarCancelacion}
                className='flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cocina;
