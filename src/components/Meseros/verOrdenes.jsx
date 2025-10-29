import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerOrdenes({ currentWaiter, openSignal }) {
  const navigate = useNavigate();

  // Orders as state so we can simulate modifications. Each order contains items and a history of change notes.
  const [orders, setOrders] = useState([
    {
      folio: 'FOL-20251025-002',
      mesa: 'Mesa 3',
      mesero: 'Carlos Ruiz',
      fecha: '25/10/2025',
      hora: '14:25:38',
      estado: 'En Preparación',
      total: 270.0,
      items: [ { name: 'Tacos de Asada', price: 60, quantity: 2 }, { name: 'Coca', price: 30, quantity: 3 } ],
      history: [],
      modified: false,
      notifiedAt: null
    },
    {
      folio: 'FOL-20251025-003',
      mesa: 'Mesa 8',
      mesero: 'María González',
      fecha: '25/10/2025',
      hora: '14:15:38',
      estado: 'Listo',
      total: 270.0,
      items: [ { name: 'Tacos de Pastor', price: 55, quantity: 2 }, { name: 'Cerveza corona/victoria', price: 40, quantity: 3 } ],
      history: [],
      modified: false,
      notifiedAt: null
    },
    {
      folio: 'FOL-20251025-004',
      mesa: 'Mesa 5',
      mesero: 'Mesero Demo',
      fecha: '25/10/2025',
      hora: '15:05:12',
      estado: 'Nuevo',
      total: 120.0,
      items: [ { name: 'Quesadilla con Carne', price: 50, quantity: 2 }, { name: 'Agua mineral', price: 20, quantity: 1 } ],
      history: [],
      modified: false,
      notifiedAt: null
    }
    ,
    {
      folio: 'FOL-20251025-005',
      mesa: 'Mesa 10',
      mesero: 'Mesero Demo',
      fecha: '25/10/2025',
      hora: '15:20:00',
      estado: 'Nuevo',
      total: 95.0,
      items: [ { name: 'Torta Cubana', price: 65, quantity: 1 }, { name: 'Coca', price: 30, quantity: 1 } ],
      history: [],
      modified: false,
      notifiedAt: null
    }
  ]);

  // Simple product list for modifications
  const products = [
    { name: 'Coca', price: 30 },
    { name: 'Jarritos Piña', price: 25 },
    { name: 'Boing Mango', price: 30 },
    { name: 'Agua mineral', price: 25 },
    { name: 'Tacos de Asada', price: 60 },
    { name: 'Torta Cubana', price: 65 },
    { name: 'Quesadilla con Carne', price: 50 },
    { name: 'Helado de Vainilla', price: 25 }
  ];

  // Modal / edit state
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [actionType, setActionType] = useState('Agregar Producto');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  // Local UI filters
  const [searchMesa, setSearchMesa] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const openEditModal = (order) => {
    // Only allow modification if order is in 'Nuevo' state
    if (order.estado !== 'Nuevo') {
      alert(`Error: No se puede modificar el pedido en estado ${order.estado}`);
      return;
    }

    // Open floating window for editing
    setEditingOrder(order);
    setShowModal(true);
  };

  // 2. Reset modal on close
  const closeModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setActionType('Agregar Producto');
    setSelectedProduct('');
    setQuantity(1);
    setReason('');
  };

  const handleConfirmChange = () => {
    if (!editingOrder) return;
    if (!reason.trim()) {
      alert('Por favor indique la razón del cambio');
      return;
    }
    const prod = products.find(p => p.name === selectedProduct);
    if (!prod) { alert('Seleccione un producto válido'); return; }

    // Copy current order to mutate
    const updated = { ...editingOrder };
    updated.items = Array.isArray(updated.items) ? [...updated.items] : [];
    let newTotal = updated.total;

    if (actionType === 'Agregar Producto') {
      // Try to find existing item
      const existing = updated.items.find(i => i.name === prod.name);
      if (existing) existing.quantity += quantity;
      else updated.items.push({ name: prod.name, price: prod.price, quantity });
      newTotal = +(newTotal + prod.price * quantity).toFixed(2);
    } else {
      // Quitar Producto
      const existing = updated.items.find(i => i.name === prod.name);
      if (!existing) { alert('El producto no existe en la orden'); return; }
      if (quantity >= existing.quantity) {
        // remove
        updated.items = updated.items.filter(i => i.name !== prod.name);
        newTotal = +(newTotal - existing.price * existing.quantity);
      } else {
        existing.quantity -= quantity;
        newTotal = +(newTotal - prod.price * quantity).toFixed(2);
      }
      newTotal = Math.max(0, +newTotal.toFixed(2));
    }

    // Add history note
    const note = {
      user: sessionStorage.getItem('waiterName') || localStorage.getItem('waiterName') || 'Mesero Demo',
      action: actionType,
      product: prod.name,
      quantity,
      reason,
      timestamp: new Date().toLocaleString(),
      previousTotal: editingOrder.total,
      newTotal
    };

    updated.total = newTotal;
    updated.history = [...(updated.history || []), note];
    updated.modified = true;
    updated.notifiedAt = new Date().toISOString();

    // Persist update into orders state
    setOrders(prev => prev.map(o => o.folio === updated.folio ? updated : o));

    // Simulate kitchen notification
    console.log('Notificación a cocina:', { folio: updated.folio, note });

    alert(`Pedido #${updated.folio} modificado. Notificación enviada a cocina`);
    closeModal();
  };

  // 3. Implement proper delete
  const handleDelete = (order) => {
    if (order.estado !== 'Nuevo') {
      alert(`Error: No se puede eliminar un pedido en estado ${order.estado}`);
      return;
    }

    if (!confirm(`¿Eliminar pedido ${order.folio}?`)) return;

    const updated = { ...order, estado: 'Cancelado' };
    setOrders(prev => prev.map(o => o.folio === order.folio ? updated : o));

    // Send notification to kitchen
    console.log('Notificación a cocina: pedido cancelado', order.folio);
  };

  // If parent informs us that VerOrdenes was opened, create a dummy order for currentWaiter
  React.useEffect(() => {
    if (!openSignal || !currentWaiter) return;
    // create a simple dummy order for this waiter
    const now = new Date();
    const folio = `FOL-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${now.getTime().toString().slice(-4)}`;
    const newOrder = {
      folio,
      mesa: `Mesa ${Math.floor(Math.random() * 20) + 1}`,
      mesero: currentWaiter,
      fecha: now.toLocaleDateString(),
      hora: now.toLocaleTimeString(),
      estado: 'Nuevo',
      items: [ { name: 'Coca', price: 30, quantity: 1 } ],
      total: 30.0,
      history: [],
      modified: false,
      notifiedAt: null
    };
    setOrders(prev => [newOrder, ...prev]);
  }, [openSignal, currentWaiter]);

  // 4. Better badge colors
  const badgeStyle = (estado) => {
    const styles = {
      'Nuevo': { bg: '#dbeafe', color: '#1e3a8a' },
      'En Preparación': { bg: '#fef3c7', color: '#92400e' },
      'Listo': { bg: '#d1fae5', color: '#065f46' }
    };
    const style = styles[estado] || styles['Nuevo'];
    return {
      padding: '6px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 700,
      color: style.color,
      background: style.bg,
      display: 'inline-block'
    };
  };

  // 1. Filter by waiter (unless admin)
  const filteredOrders = orders.filter(o => {
    // Admin sees all, waiters see only their own
    const waiterName = sessionStorage.getItem('waiterName') || 'Mesero Demo';
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'Administrador' && o.mesero !== waiterName) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'Todos' && o.estado !== statusFilter) return false;
    
    // Mesa filter
    const q = searchMesa.trim().toLowerCase();
    if (q && !o.mesa.toLowerCase().includes(q)) return false;
    
    return true;
  });

  return (
    <div style={{ padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Keep app bar + tab bar in parent (POSInterface) so this page only renders content area */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #e6e6e6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Todas las Órdenes</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e5e5', background: 'white' }}>
                <option>Todos</option>
                <option>Nuevo</option>
                <option>En Preparación</option>
                <option>Listo</option>
              </select>
              <input
                placeholder="Mesa #"
                value={searchMesa}
                onChange={e => setSearchMesa(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e5e5' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: 13 }}>
                  <th style={{ padding: '12px 8px' }}>Folio</th>
                  <th style={{ padding: '12px 8px' }}>Mesa</th>
                  <th style={{ padding: '12px 8px' }}>Mesero</th>
                  <th style={{ padding: '12px 8px' }}>Fecha/Hora</th>
                  <th style={{ padding: '12px 8px' }}>Estado</th>
                  <th style={{ padding: '12px 8px' }}>Total</th>
                  <th style={{ padding: '12px 8px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders
                  .map((o, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 8px', fontSize: 14 }}>{o.folio}</td>
                      <td style={{ padding: '16px 8px', fontSize: 14 }}>{o.mesa}</td>
                      <td style={{ padding: '16px 8px', fontSize: 14 }}>{o.mesero}</td>
                      <td style={{ padding: '16px 8px', fontSize: 13, color: '#6b7280' }}>{o.fecha}<div style={{ fontSize: 12, color: '#9ca3af' }}>{o.hora}</div></td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={badgeStyle(o.estado)}>{o.estado}</span>
                        {o.modified && <span style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 8, background: '#fff4e6', color: '#92400e', fontSize: 12, fontWeight: 700 }}>Modificado</span>}
                      </td>
                      <td style={{ padding: '16px 8px', fontSize: 14 }}>${o.total.toFixed(2)}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button title="Editar" style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e5e5', background: 'white', cursor: 'pointer' }} onClick={() => openEditModal(o)}>
                            <Edit2 size={16} />
                          </button>
                          <button title="Eliminar" style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e5e5', background: 'white', cursor: 'pointer' }} onClick={() => handleDelete(o)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating window for editing */}
      {showModal && editingOrder && (
        <EditModal 
          show={showModal}
          order={editingOrder}
          products={products}
          actionType={actionType}
          setActionType={setActionType}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          quantity={quantity}
          setQuantity={setQuantity}
          reason={reason}
          setReason={setReason}
          onCancel={closeModal}
          onConfirm={handleConfirmChange}
        />
      )}
    </div>
  );

  // Render modal instance
  // (Placed after the main return won't render — instead we render it via portal-like inclusion above by returning it conditionally.)
}

// We will render the EditModal inside the component by exporting it as a sibling component usage.

// Modal component rendering (placed after main component return)
function EditModal({ show, order, products, actionType, setActionType, selectedProduct, setSelectedProduct, quantity, setQuantity, reason, setReason, onCancel, onConfirm }) {
  if (!show || !order) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{ width: 620, background: 'white', borderRadius: 10, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Modificar Orden</h3>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div><strong>Orden:</strong> {order.folio}</div>
          <div><strong>Mesa:</strong> {order.mesa}</div>
          <div style={{ marginTop: 6 }}><strong>Total actual:</strong> ${order.total.toFixed(2)}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Acción</label>
          <select value={actionType} onChange={(e) => setActionType(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e5e5' }}>
            <option>Agregar Producto</option>
            <option>Quitar Producto</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Producto</label>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e5e5' }}>
            <option value=''>Selecciona producto</option>
            {products.map((p, idx) => (
              <option key={idx} value={p.name}>{p.name} - ${p.price}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <label style={{ minWidth: 80 }}>Cantidad</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '6px 10px' }}>−</button>
            <div style={{ width: 60, textAlign: 'center', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e5e5' }}>{quantity}</div>
            <button onClick={() => setQuantity(q => q + 1)} style={{ padding: '6px 10px' }}>+</button>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Razón del cambio *</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explica el motivo del cambio" style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #e5e5e5' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e5e5', background: 'white' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', borderRadius: 8, background: '#6b7280', color: 'white', border: 'none' }}>Confirmar Cambio</button>
        </div>
      </div>
    </div>
  );
}