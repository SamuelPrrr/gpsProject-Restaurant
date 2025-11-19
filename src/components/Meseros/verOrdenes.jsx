import React, { useState, useEffect } from 'react';
import { RefreshCw, XCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function VerOrdenes({ currentWaiter, openSignal, waiterToken }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingItem, setCancelingItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadOrders();
  }, [openSignal]);

  useEffect(() => {
    console.log('📦 Estado de orders actualizado:', orders.length, 'órdenes');
  }, [orders]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const publicUrl = `${API_ENDPOINTS.orders}/public/list`;
      console.log('🔍 Cargando órdenes...');
      console.log('📍 URL:', publicUrl);
      
      const response = await fetch(publicUrl);
      
      console.log('📡 Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        console.log('📊 Total de órdenes:', data.length);
        console.log('📄 Primera orden:', data[0]);
        
        if (!Array.isArray(data)) {
          console.error('❌ Los datos no son un array:', typeof data);
          alert('Error: La respuesta del servidor no es válida');
          return;
        }
        
        // Ordenar por fecha más reciente primero
        const sortedOrders = data.sort((a, b) => {
          const dateA = new Date(a.createdAt?._seconds ? a.createdAt._seconds * 1000 : a.createdAt || a.timestamp || 0);
          const dateB = new Date(b.createdAt?._seconds ? b.createdAt._seconds * 1000 : b.createdAt || b.timestamp || 0);
          return dateB - dateA;
        });
        console.log('🔄 Órdenes ordenadas:', sortedOrders.length);
        setOrders(sortedOrders);
        console.log('✅ Órdenes cargadas en el estado');
        console.log('📊 Estado de orders después de setOrders');
      } else {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', response.status, errorText);
        alert(`Error al cargar órdenes: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error al cargar órdenes:', error);
      alert('Error de conexión al cargar órdenes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderExpanded = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const openCancelModal = (order, item) => {
    setCancelingItem({ order, item });
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelItem = async () => {
    if (!cancelReason.trim()) {
      alert('Por favor ingresa una razón para la cancelación');
      return;
    }

    try {
      const { order, item } = cancelingItem;
      
      // Llamar al endpoint de cancelación
      const response = await fetch(`${API_ENDPOINTS.orders}/${order.id}/cancel-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-waiter-token': waiterToken || ''
        },
        body: JSON.stringify({
          productId: item.productId,
          reason: cancelReason,
          waiter: currentWaiter
        })
      });

      if (response.ok) {
        alert('Producto cancelado exitosamente');
        loadOrders(); // Recargar órdenes
        setShowCancelModal(false);
        setCancelingItem(null);
        setCancelReason('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo cancelar el producto'}`);
      }
    } catch (error) {
      console.error('Error al cancelar producto:', error);
      alert('Error de conexión al cancelar el producto');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'nuevo':
      case 'pending':
        return { bg: '#dbeafe', color: '#1e3a8a', label: 'Nuevo' };
      case 'en preparación':
      case 'preparing':
        return { bg: '#fef3c7', color: '#92400e', label: 'En Preparación' };
      case 'listo':
      case 'ready':
        return { bg: '#d1fae5', color: '#065f46', label: 'Listo' };
      case 'entregado':
      case 'delivered':
        return { bg: '#e0e7ff', color: '#3730a3', label: 'Entregado' };
      case 'cancelado':
      case 'cancelled':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' };
      default:
        return { bg: '#f3f4f6', color: '#374151', label: status };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Manejar Firebase Timestamp
    const date = dateString._seconds 
      ? new Date(dateString._seconds * 1000)
      : new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    // Manejar Firebase Timestamp
    const date = dateString._seconds 
      ? new Date(dateString._seconds * 1000)
      : new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'Todos') {
      const statusInfo = getStatusColor(order.status);
      if (statusInfo.label !== statusFilter) return false;
    }
    return true;
  });

  const canCancelItem = (order) => {
    const status = order.status?.toLowerCase();
    return status === 'nuevo' || status === 'pending';
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          margin: 0
        }}>
          Ver Órdenes
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: 'white',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option>Todos</option>
            <option>Nuevo</option>
            <option>En Preparación</option>
            <option>Listo</option>
            <option>Entregado</option>
            <option>Cancelado</option>
          </select>
          <button
            onClick={loadOrders}
            disabled={isLoading}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <RefreshCw size={32} className="spinning" style={{ marginBottom: '12px' }} />
          <div>Cargando órdenes...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            No hay órdenes
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            {statusFilter !== 'Todos' 
              ? `No hay órdenes con estado "${statusFilter}"`
              : 'Las órdenes aparecerán aquí cuando se creen'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order) => {
            const statusInfo = getStatusColor(order.status);
            const isExpanded = expandedOrders.has(order.id);
            const canCancel = canCancelItem(order);

            return (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e5e5',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* Order Header */}
                <div
                  onClick={() => toggleOrderExpanded(order.id)}
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isExpanded ? '#fafafa' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        marginBottom: '4px'
                      }}>
                        {order.orderNumber || order.id}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
                        Mesa
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>
                        {order.tableNumber || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
                        Cliente
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {order.customerName || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        background: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
                        Total
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#f97316'
                      }}>
                        ${order.total?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginLeft: '16px' }}>
                    {isExpanded ? (
                      <ChevronUp size={20} color="#666" />
                    ) : (
                      <ChevronDown size={20} color="#666" />
                    )}
                  </div>
                </div>

                {/* Order Items (Expandable) */}
                {isExpanded && (
                  <div style={{
                    padding: '0 20px 20px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    {/* Items Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                      gap: '16px',
                      padding: '16px 0',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#666',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <div>Producto</div>
                      <div>Cantidad</div>
                      <div>Precio Unit.</div>
                      <div>Subtotal</div>
                      <div>Acción</div>
                    </div>

                    {/* Items List */}
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                            gap: '16px',
                            padding: '16px 0',
                            alignItems: 'center',
                            borderBottom: idx < order.items.length - 1 ? '1px solid #f9f9f9' : 'none'
                          }}
                        >
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              marginBottom: '2px'
                            }}>
                              {item.productName || item.name}
                            </div>
                            {item.notes && (
                              <div style={{
                                fontSize: '12px',
                                color: '#999',
                                fontStyle: 'italic'
                              }}>
                                {item.notes}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '14px' }}>
                            {item.quantity}
                          </div>
                          <div style={{ fontSize: '14px' }}>
                            ${item.price?.toFixed(2) || '0.00'}
                          </div>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '600'
                          }}>
                            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </div>
                          <div>
                            {canCancel ? (
                              <button
                                onClick={() => openCancelModal(order, item)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #fee2e2',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = '#fee2e2';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = '#fef2f2';
                                }}
                              >
                                <XCircle size={14} />
                                Cancelar
                              </button>
                            ) : (
                              <span style={{
                                fontSize: '12px',
                                color: '#999'
                              }}>
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No hay productos en esta orden
                      </div>
                    )}

                    {/* Order Notes */}
                    {(order.observations || order.specialNotes) && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#fffbeb',
                        borderRadius: '8px',
                        border: '1px solid #fef3c7'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#92400e',
                          marginBottom: '4px'
                        }}>
                          Observaciones:
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#78350f'
                        }}>
                          {order.observations || order.specialNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Item Modal */}
      {showCancelModal && cancelingItem && (
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
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={24} color="#dc2626" />
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700'
              }}>
                Cancelar Producto
              </h3>
            </div>

            <p style={{
              margin: '0 0 16px',
              color: '#666',
              fontSize: '14px'
            }}>
              ¿Estás seguro de cancelar el siguiente producto?
            </p>

            <div style={{
              padding: '16px',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                {cancelingItem.item.productName || cancelingItem.item.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Cantidad: {cancelingItem.item.quantity} × ${cancelingItem.item.price?.toFixed(2)}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#111'
              }}>
                Razón de la cancelación *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej: Cliente cambió de opinión, error en la orden..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelingItem(null);
                  setCancelReason('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCancelItem}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
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
