import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Calendar, LogOut, Eye, EyeOff, Edit2, Trash2, Plus, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';
// BackButton removed: authenticate-on-entry flow replaced by in-flow token prompt
import VerOrdenes from '@/components/Meseros/verOrdenes';
import MesasActivas from '@/components/Meseros/mesasActivas';
import SolicitarCancelacion from '@/components/Meseros/cancelacion';

// Componente para Crear Orden (UI de Document 1 con funcionalidad de Document 2)
function CrearOrden({ cart, setCart, addToCart, selectedTable, setSelectedTable, customerName, setCustomerName, specialNotes, setSpecialNotes, total, showConfirmDialog, setShowConfirmDialog, orderNumber, setOrderNumber, token, setToken, waiterName, setWaiterName, showTokenInHeader, setShowTokenInHeader, incrementQuantity, decrementQuantity, removeFromCart, numberOfPeople, setNumberOfPeople }) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [tokenPromptVisible, setTokenPromptVisible] = useState(false);
  const [localToken, setLocalToken] = useState(token || '');
  const [tokenError, setTokenError] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTables, setActiveTables] = useState([]);

  // Cargar mesas activas
  useEffect(() => {
    const fetchActiveTables = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.tables);
        if (response.ok) {
          const data = await response.json();
          setActiveTables(data);
        }
      } catch (error) {
        console.error('Error al cargar mesas activas:', error);
      }
    };
    fetchActiveTables();
  }, []);

  // Cargar productos del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.products);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.filter(p => p.available));
        }
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Obtener categorías únicas de los productos
  const categories = ['Todas', ...new Set(products.map(p => p.category))];

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  // Manejar selección de mesa y autocompletar si está ocupada
  const handleTableSelect = (tableNum) => {
    setSelectedTable(tableNum);
    
    // Buscar si la mesa está ocupada
    const occupiedTable = activeTables.find(t => t.tableNumber === tableNum);
    if (occupiedTable) {
      // Autocompletar campos con datos de la mesa ocupada
      setCustomerName(occupiedTable.customerName || '');
      setNumberOfPeople(occupiedTable.numberOfPeople || 0);
    } else {
      // Si no está ocupada, limpiar los campos
      setCustomerName('');
      setNumberOfPeople(0);
    }
  };
  
  // Verificar si la mesa seleccionada está ocupada
  const isSelectedTableOccupied = selectedTable && activeTables.some(t => t.tableNumber === selectedTable);

  const handleSendOrder = () => {
    if (!selectedTable) {
      alert('Por favor seleccione una mesa');
      return;
    }
    if (cart.length === 0) {
      alert('El pedido debe contener al menos un producto');
      return;
    }
    if (!customerName) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }
    // Ask waiter for token before confirming the order
    setTokenError('');
    setLocalToken(token || '');
    setTokenPromptVisible(true);
  };

  const confirmTokenAndProceed = () => {
    if (!localToken || localToken.trim().length === 0) {
      setTokenError('Por favor ingresa tu token');
      return;
    }
    // Persist token and waiter name in parent
    setToken(localToken);
    setWaiterName('Mesero ' + localToken);
    setOrderNumber(`ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    setShowConfirmDialog(true);
    setTokenPromptVisible(false);
  };

  const confirmOrder = async () => {
    try {
      // Verificar que tenemos el token
      if (!token || token.trim().length === 0) {
        alert('Error: Token de mesero no disponible. Por favor intenta de nuevo.');
        setShowConfirmDialog(false);
        return;
      }

      const orderData = {
        tableNumber: selectedTable,
        customerName: customerName,
        numberOfPeople: numberOfPeople || 0,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        observations: specialNotes,
        total: total,
        token: token // Enviar token en el body también
      };

      // Crear la orden (ahora automáticamente crea/actualiza la mesa)
      const orderResponse = await fetch(API_ENDPOINTS.orders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-waiter-token': token
        },
        body: JSON.stringify(orderData)
      });

      if (orderResponse.ok) {
        const createdOrder = await orderResponse.json();
        
        alert(`¡Pedido enviado exitosamente!\nMesa: ${selectedTable}\nTotal: $${total.toFixed(2)}`);
        setShowConfirmDialog(false);
        setCart([]);
        setCustomerName('');
        setSpecialNotes('');
        setSelectedTable(null);
        setNumberOfPeople(0);
        // Limpiar el token para que se pida nuevamente en el siguiente pedido
        setToken('');
        setWaiterName('');
      } else {
        const error = await orderResponse.json();
        alert(`Error al enviar el pedido (${orderResponse.status}):\n${error.message || 'Intenta de nuevo'}`);
      }
    } catch (error) {
      console.error('Error al enviar pedido:', error);
      alert('Error de conexión. Verifica tu conexión a internet.');
    }
  };

  return (
    <>
      {/* Token prompt modal shown when waiter clicks "Enviar Pedido a Cocina" */}
      {tokenPromptVisible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 420 }}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Confirma tu identidad</h3>
            <p style={{ marginTop: 0, marginBottom: 12, color: '#666' }}>Ingresa tu token para confirmar el envío del pedido a cocina.</p>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                type={showTokenInput ? 'text' : 'password'}
                value={localToken}
                onChange={e => setLocalToken(e.target.value)}
                placeholder="Token del mesero"
                style={{ width: '100%', padding: '10px 36px 10px 10px', borderRadius: 6, border: '1px solid #e5e5e5' }}
              />
              <button
                type="button"
                onClick={() => setShowTokenInput(s => !s)}
                aria-label={showTokenInput ? 'Ocultar token' : 'Mostrar token'}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                {showTokenInput ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {tokenError && <div style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{tokenError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => {
                setTokenPromptVisible(false);
                setLocalToken('');
                setTokenError('');
              }} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e5e5', background: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
              <button onClick={confirmTokenAndProceed} style={{ flex: 1, padding: 10, borderRadius: 8, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmDialog && (
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
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1px', fontSize: '20px' }}>Confirmar Pedido</h2>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#314A66FF' }}>
                Pedido Realizado: {orderNumber}
              </p>
              <p style={{ marginBottom: '12px' }}><strong>Mesero:</strong> {waiterName}</p>
              <p style={{ marginBottom: '12px' }}><strong>Mesa:</strong> {selectedTable}</p>
              <p style={{ marginBottom: '12px' }}><strong>Cliente:</strong> {customerName || 'Sin nombre'}</p>
              <p style={{ marginBottom: '12px' }}><strong>Productos:</strong></p>
              <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
                {cart.map(item => (
                  <li key={item.id}>{item.name} x {item.quantity} - ${item.price * item.quantity}</li>
                ))}
              </ul>
              <p style={{ fontSize: '18px', fontWeight: '700' }}><strong>Total:</strong> ${total.toFixed(2)}</p>
              {specialNotes && (
                <p style={{ marginTop: '12px', color: '#666' }}><strong>Notas:</strong> {specialNotes}</p>
              )}
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Token del mesero: {showTokenInHeader ? token : '•••••'}
                <button
                  onClick={() => setShowTokenInHeader(!showTokenInHeader)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#014FA8FF',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '8px',
                    textDecoration: 'underline'
                  }}
                >
                  {showTokenInHeader ? 'Ocultar' : 'Mostrar'}
                </button>
              </p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Pedido realizado el: {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
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
                onClick={confirmOrder}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
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
                Confirmar y Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: 'calc(100vh - 140px)' }}>
        {/* Panel izquierdo - Productos */}
        <div className="hide-scrollbar smooth-scroll" style={{
          flex: 1,
          background: '#ffffff',
          padding: '20px',
          overflowY: 'auto',
          borderRight: '1px solid #e5e5e5'
        }}>
          {/* Buscador */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Categorías principales */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubcategory(null);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#f5f5f5',
                  color: selectedCategory === cat ? '#ffffff' : '#111',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.background = '#e5e5e5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.background = '#f5f5f5';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Indicador de carga */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Cargando productos...
            </div>
          )}

          {/* Productos */}
          {!loading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {filteredProducts.length === 0 ? (
                <div style={{ 
                  gridColumn: '1/-1', 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '40px',
                  fontSize: '14px'
                }}>
                  {searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'No hay productos disponibles'}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} style={{
                    background: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '16px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    <div style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      marginBottom: '4px',
                      color: '#111'
                    }}>
                      {product.name}
                    </div>
                    {product.description && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        marginBottom: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {product.description}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: '#f97316', 
                      marginBottom: '12px'
                    }}>
                      ${product.price.toFixed(2)}
                    </div>
                    <button 
                      onClick={() => addToCart(product)} 
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.3)';
                      }}
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Panel derecho - Pedido */}
        <div className="hide-scrollbar smooth-scroll" style={{
          width: '380px',
          background: '#ffffff',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            fontSize: '18px',
            fontWeight: '700'
          }}>
            <ShoppingCart size={20} />
            Pedido Actual
          </div>

          {/* Selector de mesa */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#666' }}>
              Mesa <span style={{ color: 'red' }}>*</span>
            </div>
            <div className="hide-scrollbar smooth-scroll" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {tables.map(table => {
                const isOccupied = activeTables.some(t => t.tableNumber === table);
                return (
                  <button
                    key={table}
                    onClick={() => handleTableSelect(table)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: selectedTable === table ? '2px solid #f97316' : '1px solid #e5e5e5',
                      background: selectedTable === table 
                        ? '#fff7ed' 
                        : isOccupied 
                          ? '#fef3c7' 
                          : 'white',
                      fontSize: '14px',
                      fontWeight: selectedTable === table ? '700' : '400',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s'
                    }}
                  >
                    {table}
                    {isOccupied && (
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#f97316'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cliente */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#666'
            }}>
              Cliente <span style={{ color: 'red' }}>*</span>
              {isSelectedTableOccupied && (
                <span style={{ fontSize: '11px', fontWeight: '400', color: '#f97316', marginLeft: '8px' }}>
                  (no editable)
                </span>
              )}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
              disabled={isSelectedTableOccupied}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                background: isSelectedTableOccupied ? '#f9f9f9' : 'white',
                cursor: isSelectedTableOccupied ? 'not-allowed' : 'text',
                color: isSelectedTableOccupied ? '#666' : '#000'
              }}
            />
          </div>

          {/* Número de personas */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#666'
            }}>
              Número de Personas
              {isSelectedTableOccupied && (
                <span style={{ fontSize: '11px', fontWeight: '400', color: '#f97316', marginLeft: '8px' }}>
                  (no editable)
                </span>
              )}
            </label>
            <input
              type="number"
              min="0"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 0)}
              placeholder="Número de comensales"
              disabled={isSelectedTableOccupied}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                background: isSelectedTableOccupied ? '#f9f9f9' : 'white',
                cursor: isSelectedTableOccupied ? 'not-allowed' : 'text',
                color: isSelectedTableOccupied ? '#666' : '#000'
              }}
            />
          </div>

          {/* Notas especiales */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#666'
            }}>
              Observaciones (Opcional, máx. 200 caracteres)
            </label>
            <textarea
              value={specialNotes}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  setSpecialNotes(e.target.value);
                }
              }}
              placeholder="ej. sin cebolla, término medio, extra picante"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                minHeight: '100px',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
              {specialNotes.length}/200
            </div>
          </div>

          {/* Items del carrito */}
          <div className="hide-scrollbar smooth-scroll" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', minHeight: '200px' }}>
            {cart.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#999',
                padding: '40px 20px',
                fontSize: '14px'
              }}>
                No hay ítems en el pedido
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: '8px',
                    background: '#f9f9f9',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      ${item.price} x {item.quantity} = ${item.price * item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #e5e5e5',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #e5e5e5',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #e5e5e5',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total y botones */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSendOrder}
              disabled={cart.length === 0 || !selectedTable || !customerName}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: cart.length === 0 || !selectedTable || !customerName 
                  ? '#e5e5e5' 
                  : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: cart.length === 0 || !selectedTable || !customerName ? '#999' : 'white',
                border: 'none',
                cursor: cart.length === 0 || !selectedTable || !customerName ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
                boxShadow: cart.length === 0 || !selectedTable || !customerName 
                  ? 'none' 
                  : '0 4px 12px rgba(249, 115, 22, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              ✓ Enviar Pedido a Cocina
            </button>

            <button
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                background: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              📄 Generar Cuenta
            </button>

            <button
              onClick={() => {
                setCart([]);
                setSelectedTable(null);
                setCustomerName('');
                setNumberOfPeople(0);
                setSpecialNotes('');
              }}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '12px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#666',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}



// Componente principal que preserva App Bar y Tab Bar
export default function POSInterface() {
  // Authentication-on-entry removed: token will be requested when confirming an order
  const [token, setToken] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [showTokenInHeader, setShowTokenInHeader] = useState(false);
  const [activeTab, setActiveTab] = useState('crear-orden');
  const navigate = useNavigate();
  const [verOrdersSignal, setVerOrdersSignal] = useState(0);

  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(0);
  const [specialNotes, setSpecialNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  const addToCart = (p) => {
    const ex = cart.find(i => i.name === p.name);
    if (ex) {
      setCart(cart.map(i => i.name === p.name ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...p, id: Date.now(), quantity: 1 }]);
    }
  };

  const incrementQuantity = (id) => setCart(cart.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const decrementQuantity = (id) => setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

  const handleLogin = (e) => { e?.preventDefault(); if (token && token.length > 0) { setWaiterName('Mesero ' + token); setIsAuthenticated(true); } else { alert('Token inválido'); } };

  // No initial login screen. The UI is available immediately; token will be requested when confirming an order.

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#f5f5f5' }}>
      {/* Header unificado */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <ShoppingCart size={24} color='white' />
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '28px', 
                fontWeight: '700', 
                color: 'white',
                letterSpacing: '-0.5px'
              }}>
                Pedidos
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.8)',
                marginTop: '4px'
              }}>
                Gestión de órdenes
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setToken(''); setWaiterName(''); sessionStorage.removeItem('waiterName'); navigate('/'); }} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ 
          flex: 1, 
          background: '#fff', 
          padding: activeTab === 'mesas-activas' ? '20px' : '20px 32px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* Tab bar */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '0'
          }}>
            <button 
              onClick={() => setActiveTab('crear-orden')} 
              style={{ 
                padding: '12px 20px', 
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'crear-orden' ? '3px solid #f97316' : '3px solid transparent',
                color: activeTab === 'crear-orden' ? '#f97316' : '#666',
                cursor: 'pointer', 
                fontWeight: activeTab === 'crear-orden' ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShoppingCart size={18} />
              Crear Orden
            </button>
            <button 
              onClick={() => { setActiveTab('ver-ordenes'); setVerOrdersSignal(s => s + 1); }} 
              style={{ 
                padding: '12px 20px', 
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'ver-ordenes' ? '3px solid #f97316' : '3px solid transparent',
                color: activeTab === 'ver-ordenes' ? '#f97316' : '#666',
                cursor: 'pointer', 
                fontWeight: activeTab === 'ver-ordenes' ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Calendar size={18} />
              Ver Órdenes
            </button>
            <button 
              onClick={() => setActiveTab('mesas-activas')} 
              style={{ 
                padding: '12px 20px', 
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'mesas-activas' ? '3px solid #f97316' : '3px solid transparent',
                color: activeTab === 'mesas-activas' ? '#f97316' : '#666',
                cursor: 'pointer', 
                fontWeight: activeTab === 'mesas-activas' ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <DollarSign size={18} />
              Mesas Activas
            </button>
            <button 
              onClick={() => setActiveTab('solicitar-cancelacion')} 
              style={{ 
                padding: '12px 20px', 
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'solicitar-cancelacion' ? '3px solid #f97316' : '3px solid transparent',
                color: activeTab === 'solicitar-cancelacion' ? '#f97316' : '#666',
                cursor: 'pointer', 
                fontWeight: activeTab === 'solicitar-cancelacion' ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ❌
              Cancelación
            </button>
          </div>

          {/* Content area */}
          <div style={{ 
            flex: activeTab === 'mesas-activas' ? 1 : 'initial',
            display: activeTab === 'mesas-activas' ? 'flex' : 'block',
            minHeight: 0
          }}>
            {activeTab === 'ver-ordenes' ? (
              <VerOrdenes currentWaiter={waiterName} openSignal={verOrdersSignal} waiterToken={token} />
            ) : activeTab === 'mesas-activas' ? (
              <MesasActivas />
            ) : activeTab === 'solicitar-cancelacion' ? (
              <SolicitarCancelacion />
            ) : (
              <CrearOrden
              cart={cart}
              setCart={setCart}
              addToCart={addToCart}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              customerName={customerName}
              setCustomerName={setCustomerName}
              numberOfPeople={numberOfPeople}
              setNumberOfPeople={setNumberOfPeople}
              specialNotes={specialNotes}
              setSpecialNotes={setSpecialNotes}
              total={total}
              showConfirmDialog={showConfirmDialog}
              setShowConfirmDialog={setShowConfirmDialog}
              orderNumber={orderNumber}
              setOrderNumber={setOrderNumber}
              token={token}
              setToken={setToken}
              setWaiterName={setWaiterName}
              waiterName={waiterName}
              showTokenInHeader={showTokenInHeader}
              setShowTokenInHeader={setShowTokenInHeader}
              incrementQuantity={incrementQuantity}
              decrementQuantity={decrementQuantity}
              removeFromCart={removeFromCart}
            />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
