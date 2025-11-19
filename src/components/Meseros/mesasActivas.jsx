import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, DollarSign, Clock, User, XCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function MesasActivas() {
  const [activeTables, setActiveTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState(null);
  const [waiterToken, setWaiterToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenError, setTokenError] = useState('');


  useEffect(() => {
    loadActiveTables();
  }, []);

  const loadActiveTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Consulta pública, no requiere autenticación
      const response = await fetch(API_ENDPOINTS.tables, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tables = await response.json();
        setActiveTables(tables);
      } else {
        setError('Error al cargar las mesas activas');
        console.error('Error al cargar mesas:', response.status);
      }
    } catch (err) {
      console.error('Error al cargar mesas:', err);
      setError('Error de conexión al cargar mesas');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTableTotal = (table) => {
    // Usar totalActiveOrders si está disponible, sino calcular de activeOrders
    if (table.totalActiveOrders !== undefined) {
      return table.totalActiveOrders;
    }
    return table.total || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
      case 'En Preparación':
        return '#3b82f6';
      case 'ready':
      case 'Listo':
        return '#10b981';
      case 'new':
      case 'Nuevo':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return 'Nuevo';
      case 'preparing':
        return 'En Preparación';
      case 'ready':
        return 'Listo';
      case 'delivered':
        return 'Entregado';
      default:
        return status || 'Nuevo';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Hora desconocida';
    
    // Si es un timestamp de Firestore (objeto con seconds)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Si es un string ISO
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Si es un Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return 'Hora desconocida';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return '--:--';
  };

  const handleCloseTable = async () => {
    if (!waiterToken || waiterToken.trim().length === 0) {
      setTokenError('Por favor ingresa tu token de mesero');
      return;
    }

    setIsLoading(true);
    setTokenError('');
    try {
      const authToken = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.tables}/${selectedTable.id}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod })
      });

      if (response.ok) {
        alert(`Mesa ${selectedTable.tableNumber} cerrada exitosamente\nTotal: $${calculateTableTotal(selectedTable).toFixed(2)}\nMétodo de pago: ${paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}`);
        
        // Remover mesa de la lista local
        setActiveTables(activeTables.filter(t => t.id !== selectedTable.id));
        setSelectedTable(null);
        setShowCloseModal(false);
        setWaiterToken('');
        setTokenError('');
      } else {
        const error = await response.json();
        alert(`Error al cerrar la mesa: ${error.message || 'Intenta de nuevo'}`);
      }
    } catch (err) {
      console.error('Error al cerrar mesa:', err);
      alert('Error de conexión al cerrar la mesa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, gap: '24px', minHeight: 0 }}>
      {/* Panel izquierdo - Lista de mesas activas */}
      <div style={{
        width: '350px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: 0
          }}>
            Mesas Activas
          </h2>
          <button
            onClick={loadActiveTables}
            disabled={isLoading}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid #e5e5e5',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={18} color="#666" className={isLoading ? 'spinning' : ''} />
          </button>
        </div>

        {isLoading && activeTables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            Cargando mesas...
          </div>
        ) : activeTables.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              No hay mesas activas
            </div>
            <div style={{ fontSize: '13px', color: '#999' }}>
              Las mesas con pedidos aparecerán aquí
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeTables.map((table) => (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: selectedTable?.tableNumber === table.tableNumber 
                    ? '2px solid #f97316' 
                    : '1px solid #e5e5e5',
                  background: selectedTable?.tableNumber === table.tableNumber 
                    ? '#fff7ed' 
                    : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedTable?.tableNumber !== table.tableNumber) {
                    e.currentTarget.style.background = '#f9f9f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTable?.tableNumber !== table.tableNumber) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111'
                  }}>
                    Mesa {table.tableNumber}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#f97316'
                  }}>
                    ${calculateTableTotal(table).toFixed(2)}
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={14} />
                  {(table.activeOrders?.length > 0 || table.orders?.length > 0) ? (
                    <>
                      {formatTime(table.createdAt)} • {(table.activeOrders?.length || table.orders?.length || 0)} orden{(table.activeOrders?.length || table.orders?.length) !== 1 ? 'es' : ''}
                    </>
                  ) : 'Sin órdenes'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel derecho - Detalles de la mesa seleccionada */}
      <div style={{
        flex: 1,
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        padding: '24px',
        overflowY: 'auto'
      }}>
        {!selectedTable ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              Selecciona una mesa
            </div>
            <div style={{ fontSize: '14px' }}>
              Elige una mesa de la lista para ver los detalles de la cuenta
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '20px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  Mesa {selectedTable.tableNumber}
                </h2>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Cliente: {selectedTable.customerName || 'Sin nombre'}
                  {selectedTable.numberOfPeople > 0 && ` • ${selectedTable.numberOfPeople} persona${selectedTable.numberOfPeople !== 1 ? 's' : ''}`}
                  {` • ${selectedTable.activeOrders?.length || selectedTable.orders?.length || 0} orden${(selectedTable.activeOrders?.length || selectedTable.orders?.length) !== 1 ? 'es' : ''} activa${(selectedTable.activeOrders?.length || selectedTable.orders?.length) !== 1 ? 's' : ''}`}
                </div>
              </div>
              <button
                onClick={() => setShowCloseModal(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <DollarSign size={18} />
                Cerrar Mesa
              </button>
            </div>

            {/* Orders */}
            {(selectedTable.activeOrders || selectedTable.orders)?.map((order, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx < (selectedTable.activeOrders || selectedTable.orders).length - 1 ? '24px' : '0',
                  paddingBottom: idx < (selectedTable.activeOrders || selectedTable.orders).length - 1 ? '24px' : '0',
                  borderBottom: idx < (selectedTable.activeOrders || selectedTable.orders).length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      Orden #{order.orderId || order.id || idx + 1}
                    </div>
                    {/* <div style={{ fontSize: '13px', color: '#666' }}>
                      {formatTimestamp(order.addedAt || order.createdAt)}
                    </div> */}
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: `${getStatusColor(order.status || 'new')}15`,
                      color: getStatusColor(order.status || 'new')
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Order Details */}
                <div style={{
                  background: '#fafafa',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#666', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} />
                      <strong style={{ color: '#111' }}>Mesero:</strong> {order.waiterName || selectedTable.waiterName || 'No asignado'}
                    </div>
                    {order.observations && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 100%' }}>
                        <strong style={{ color: '#111' }}>Observaciones:</strong> {order.observations}
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div style={{ marginBottom: '16px' }}>
                  {order.items?.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: itemIdx < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                          {item.productName || item.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {item.quantity} x ${item.price?.toFixed(2) || 0}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#111'
                      }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )) || (
                    <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', padding: '20px' }}>
                      Sin productos
                    </div>
                  )}
                </div>

                {/* Subtotal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  fontSize: '15px',
                  fontWeight: '600'
                }}>
                  <span>Subtotal:</span>
                  <span>${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}

            {/* Total General */}
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              borderRadius: '12px',
              border: '2px solid #f97316',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111'
              }}>
                Total a Pagar:
              </span>
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#f97316'
              }}>
                ${calculateTableTotal(selectedTable).toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Modal de cerrar mesa */}
      {showCloseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              margin: 0,
              marginBottom: '8px',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              Cerrar Mesa {selectedTable.tableNumber}
            </h3>
            <p style={{
              margin: 0,
              marginBottom: '24px',
              color: '#666',
              fontSize: '14px'
            }}>
              Confirma el método de pago para cerrar la cuenta
            </p>

            {/* Total destacado */}
            <div style={{
              padding: '20px',
              background: '#fff7ed',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                Total a pagar
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f97316' }}>
                ${calculateTableTotal(selectedTable).toFixed(2)}
              </div>
            </div>

            {/* Token del mesero */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#111'
              }}>
                Token del Mesero <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showTokenInput ? 'text' : 'password'}
                  value={waiterToken}
                  onChange={(e) => setWaiterToken(e.target.value)}
                  placeholder="Ingresa tu token"
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    borderRadius: '8px',
                    border: tokenError ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTokenInput(s => !s)}
                  aria-label={showTokenInput ? 'Ocultar token' : 'Mostrar token'}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showTokenInput ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
                </button>
              </div>
              {tokenError && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>
                  {tokenError}
                </div>
              )}
            </div>

            {/* Método de pago */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111'
              }}>
                Método de Pago
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '8px',
                    border: paymentMethod === 'cash' ? '2px solid #f97316' : '1px solid #e5e5e5',
                    background: paymentMethod === 'cash' ? '#fff7ed' : 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  💵 Efectivo
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '8px',
                    border: paymentMethod === 'card' ? '2px solid #f97316' : '1px solid #e5e5e5',
                    background: paymentMethod === 'card' ? '#fff7ed' : 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  💳 Tarjeta
                </button>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setWaiterToken('');
                  setTokenError('');
                }}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  background: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <XCircle size={18} />
                Cancelar
              </button>
              <button
                onClick={handleCloseTable}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: isLoading 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="spinning" />
                    Cerrando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirmar Cierre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
