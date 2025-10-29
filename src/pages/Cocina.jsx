
  import React, { useState, useEffect, useRef } from 'react';
  import { ArrowLeft, ChefHat, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
  import BackButton from '../components/ui/BackButton';
  
  // Main Kitchen Panel Component
  const Cocina = () => {
    {
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

      // UI theme colors (blue / white / black)
      const theme = {
        bg: "linear-gradient(135deg, #f8fafc 0%, #eaf2ff 100%)",
        card: "#ffffff",
        primary: "#1d4ed8", // blue
        dark: "#0f172a", // near black
      };

      // Status pastel colors: pendiente (rojo), preparando (amarillo), listo (verde)
      const statusColors = {
        pendiente: { bg: "#fff1f2", border: "#fca5a5", text: "#991b1b" }, // pastel red
        preparando: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" }, // pastel yellow
        listo: { bg: "#ecfdf5", border: "#bbf7d0", text: "#065f46" }, // pastel green
      };

      return (
        <div
          style={{
            minHeight: "100vh",
            background: theme.bg,
            padding: "24px",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: theme.dark,
          }}
        >
          {/* Back button to return to previous view */}
          <div style={{ marginBottom: 12 }}>
            <BackButton
              onClick={() => window.history.back()}
              label='Regresar'
            />
          </div>
          {/* Header */}
          <div
            style={{
              background: theme.card,
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "18px",
              boxShadow: "0 6px 18px rgba(13,30,62,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: theme.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <ChefHat
                  size={20}
                  color={theme.card === "#ffffff" ? "#fff" : theme.primary}
                />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                  Panel de Cocina
                </h2>
                <div style={{ fontSize: 13, color: "#475569" }}>
                  Gestión de pedidos - Módulo 5
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 14, color: "#475569" }}>Conexión:</div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: connected ? "#ecfeff" : "#fff1f2",
                  color: connected ? "#065f46" : "#991b1b",
                  border: `1px solid ${connected ? "#bbf7ff" : "#fecaca"}`,
                }}
              >
                {connected ? "Conectado" : "Reconectando..."}
              </div>
            </div>
          </div>

          {/* Banner */}
          {banner && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                borderRadius: 8,
                background:
                  banner.type === "error"
                    ? "#fff1f2"
                    : banner.type === "success"
                    ? "#ecfdf5"
                    : "#eff6ff",
                color:
                  banner.type === "error"
                    ? "#991b1b"
                    : banner.type === "success"
                    ? "#065f46"
                    : theme.primary,
                border: `1px solid ${
                  banner.type === "error"
                    ? "#fecaca"
                    : banner.type === "success"
                    ? "#bbf7d0"
                    : "#bfdbfe"
                }`,
              }}
            >
              {banner.text}
            </div>
          )}

          {/* Counts / Sections */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                background: statusColors.pendiente.bg,
                padding: "10px 14px",
                borderRadius: 8,
                color: statusColors.pendiente.text,
                fontWeight: 700,
              }}
            >
              Nuevo: {grouped.pendiente.length}
            </div>
            <div
              style={{
                background: statusColors.preparando.bg,
                padding: "10px 14px",
                borderRadius: 8,
                color: statusColors.preparando.text,
                fontWeight: 700,
              }}
            >
              En Preparación: {grouped.preparando.length}
            </div>
            <div
              style={{
                background: statusColors.listo.bg,
                padding: "10px 14px",
                borderRadius: 8,
                color: statusColors.listo.text,
                fontWeight: 700,
              }}
            >
              Listo: {grouped.listo.length}
            </div>
          </div>

          {/* Sections Grid */}
          {orders.length === 0 ? (
            <div
              style={{
                background: theme.card,
                borderRadius: 12,
                padding: "48px",
                textAlign: "center",
                boxShadow: "0 6px 18px rgba(13,30,62,0.06)",
              }}
            >
              <ChefHat
                size={64}
                color='#c7d2fe'
                style={{ margin: "0 auto 16px" }}
              />
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "20px",
                  color: theme.dark,
                }}
              >
                No hay órdenes en cocina
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                No hay pedidos
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
              }}
            >
              {/* Nuevo */}
              <div>
                <h4 style={{ marginTop: 0, color: theme.primary }}>Nuevo</h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {grouped.pendiente.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: theme.card,
                        borderRadius: 12,
                        padding: 14,
                        boxShadow: "0 6px 14px rgba(2,6,23,0.04)",
                        borderLeft: `4px solid ${statusColors.pendiente.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#475569",
                              fontWeight: 700,
                            }}
                          >
                            Mesa {order.mesa} — {order.cliente}
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            Pedido #{order.id} •{" "}
                            {getElapsedTime(order.timestamp)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancelModal(true);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                            title='Cancelar pedido'
                          >
                            <XCircle />
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          background: "#f8fafc",
                          padding: 10,
                          borderRadius: 8,
                        }}
                      >
                        {order.productos.map((p, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 0",
                              borderBottom:
                                i < order.productos.length - 1
                                  ? "1px dashed #e6eefc"
                                  : "none",
                            }}
                          >
                            <div style={{ fontSize: 14 }}>
                              {p.cantidad}x {p.nombre}
                            </div>
                            {p.observaciones && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#0f172a",
                                  background: "#fff7cc",
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                }}
                              >
                                {p.observaciones}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {order.observaciones && (
                        <div
                          style={{
                            marginTop: 10,
                            background: "#fff7cc",
                            padding: 8,
                            borderRadius: 8,
                            color: "#92400e",
                          }}
                        >
                          <strong>Nota:</strong> {order.observaciones}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          onClick={() => marcarEnPreparacion(order.id)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: 8,
                            background: theme.primary,
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
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
                <h4 style={{ marginTop: 0, color: "#0f172a" }}>
                  En Preparación
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {grouped.preparando.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: theme.card,
                        borderRadius: 12,
                        padding: 14,
                        boxShadow: "0 6px 14px rgba(2,6,23,0.04)",
                        borderLeft: `4px solid ${statusColors.preparando.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#0f172a",
                              fontWeight: 800,
                            }}
                          >
                            {order.cliente} — Mesa {order.mesa}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            Pedido #{order.id} •{" "}
                            {getElapsedTime(order.timestamp)}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Mesero: {order.mesero}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          background: "#f8fafc",
                          padding: 10,
                          borderRadius: 8,
                        }}
                      >
                        {order.productos.map((p, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 0",
                              borderBottom:
                                i < order.productos.length - 1
                                  ? "1px dashed #eef2ff"
                                  : "none",
                            }}
                          >
                            <div>
                              {p.cantidad}x {p.nombre}
                            </div>
                            {p.observaciones && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#92400e",
                                  background: "#fff7cc",
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                }}
                              >
                                {p.observaciones}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          onClick={() => marcarListo(order.id)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: 8,
                            background: "#059669",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
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
                <h4 style={{ marginTop: 0, color: "#0f172a" }}>Listo</h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {grouped.listo.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: theme.card,
                        borderRadius: 12,
                        padding: 14,
                        boxShadow: "0 6px 14px rgba(2,6,23,0.04)",
                        borderLeft: `4px solid ${statusColors.listo.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#0f172a",
                              fontWeight: 800,
                            }}
                          >
                            Mesa {order.mesa} — {order.cliente}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            Pedido #{order.id} •{" "}
                            {getElapsedTime(order.timestamp)}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Mesero: {order.mesero}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          background: "#f8fafc",
                          padding: 10,
                          borderRadius: 8,
                        }}
                      >
                        {order.productos.map((p, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 0",
                              borderBottom:
                                i < order.productos.length - 1
                                  ? "1px dashed #e6f4ea"
                                  : "none",
                            }}
                          >
                            <div>
                              {p.cantidad}x {p.nombre}
                            </div>
                            {p.observaciones && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#92400e",
                                  background: "#fff7cc",
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                }}
                              >
                                {p.observaciones}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 13,
                          color: "#64748b",
                        }}
                      >
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
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(2,6,23,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: theme.card,
                  borderRadius: 12,
                  padding: 20,
                  width: 520,
                  boxShadow: "0 20px 40px rgba(2,6,23,0.15)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 18 }}>
                  Cancelar Pedido {selectedOrder.id}
                </h3>
                <p style={{ color: "#475569" }}>
                  Mesa {selectedOrder.mesa} - {selectedOrder.cliente}
                </p>

                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Ingrediente faltante *
                  </label>
                  <input
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder='Ej: Mojarra fresca'
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6eefc",
                    }}
                  />
                </div>

                <div
                  style={{
                    background: "#fff7cc",
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 12,
                    color: "#92400e",
                  }}
                >
                  <strong>Advertencia:</strong> Esta acción notificará
                  inmediatamente al mesero {selectedOrder.mesero}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason("");
                      setSelectedOrder(null);
                    }}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6eefc",
                      background: "#fff",
                    }}
                  >
                    Volver
                  </button>
                  <button
                    onClick={confirmarCancelacion}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Confirmar Cancelación
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

export default Cocina;