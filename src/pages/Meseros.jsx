import React, { useState } from 'react';
import { Search, ShoppingCart, User, Calendar, LogOut, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/ui/BackButton';
import VerOrdenes from '@/components/Meseros/verOrdenes';
import CuentaMesa from '@/components/Meseros/cuentaMesa';
import CerrarMesa from '@/components/Meseros/cerrarMesa';
import SolicitarCancelacion from '@/components/Meseros/cancelacion';

// Componente para Crear Orden (UI de Document 1 con funcionalidad de Document 2)
function CrearOrden({ cart, setCart, addToCart, selectedTable, setSelectedTable, customerName, setCustomerName, specialNotes, setSpecialNotes, total, showConfirmDialog, setShowConfirmDialog, orderNumber, setOrderNumber, token, waiterName, showTokenInHeader, setShowTokenInHeader, incrementQuantity, decrementQuantity, removeFromCart }) {
  const [selectedCategory, setSelectedCategory] = useState('Bebidas');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');

  const categories = [
    { name: 'Bebidas', subcategories: ['Coca', 'Jarritos', 'Boing', 'Agua', 'Cerveza', 'Otros'] },
    { name: 'Platillos', subcategories: ['Tacos', 'Tortas', 'Quesadillas'] },
    { name: 'Postres', subcategories: ['Helados', 'Pasteles', 'Flanes'] }
  ];

  const products = {
    'Coca': [
      { name: 'Coca', price: 30, category: 'Bebidas' },
      { name: 'Coca Zero', price: 30, category: 'Bebidas' }
    ],
    'Jarritos': [
      { name: 'Jarritos Piña', price: 25, category: 'Bebidas' },
      { name: 'Jarritos Tamarindo', price: 25, category: 'Bebidas' },
      { name: 'Jarritos Limón', price: 25, category: 'Bebidas' },
      { name: 'Jarritos Toronja', price: 25, category: 'Bebidas' },
      { name: 'Jarritos Tutti Frutti', price: 25, category: 'Bebidas' },
      { name: 'Jarritos Mandarina', price: 25, category: 'Bebidas' }
    ],
    'Boing': [
      { name: 'Boing Guayaba', price: 30, category: 'Bebidas' },
      { name: 'Boing Mango', price: 30, category: 'Bebidas' }
    ],
    'Agua': [
      { name: 'Agua mineral', price: 25, category: 'Bebidas' },
      { name: 'Agua natural (1lt)', price: 25, category: 'Bebidas' },
      { name: 'Jarra de agua 1lt (tamarindo)', price: 45, category: 'Bebidas' },
      { name: 'Jarra de agua 2lts (tamarindo)', price: 55, category: 'Bebidas' },
      { name: 'Jarra de agua 3lts (tamarindo)', price: 80, category: 'Bebidas' }
    ],
    'Cerveza': [
      { name: 'Cerveza corona/victoria', price: 40, category: 'Bebidas' },
      { name: 'Michelada', price: 55, category: 'Bebidas' },
      { name: 'Cubana', price: 40, category: 'Bebidas' },
      { name: 'Clamato', price: 55, category: 'Bebidas' }
    ],
    'Otros': [
      { name: 'Sidral (aga)', price: 30, category: 'Bebidas' },
      { name: 'Rusa', price: 45, category: 'Bebidas' }
    ],
    'Tacos': [
      { name: 'Tacos de Asada', price: 60, category: 'Platillos' },
      { name: 'Tacos de Pastor', price: 55, category: 'Platillos' }
    ],
    'Tortas': [
      { name: 'Torta de Jamón', price: 45, category: 'Platillos' },
      { name: 'Torta Cubana', price: 65, category: 'Platillos' }
    ],
    'Quesadillas': [
      { name: 'Quesadilla Sencilla', price: 35, category: 'Platillos' },
      { name: 'Quesadilla con Carne', price: 50, category: 'Platillos' }
    ],
    'Helados': [
      { name: 'Helado de Vainilla', price: 25, category: 'Postres' },
      { name: 'Helado de Chocolate', price: 25, category: 'Postres' }
    ],
    'Pasteles': [
      { name: 'Pastel de Chocolate', price: 40, category: 'Postres' }
    ],
    'Flanes': [
      { name: 'Flan Napolitano', price: 35, category: 'Postres' }
    ]
  };

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  const bebidasGrouped = Object.entries(products).reduce((acc, [subcategory, items]) => {
    if (categories.find((cat) => cat.name === 'Bebidas').subcategories.includes(subcategory)) {
      acc[subcategory] = items.map((item) => item.name);
    }
    return acc;
  }, {});

  const platillosSizes = ['Chico', 'Mediano', 'Grande'];

  // Search helper: collect matching products across all categories
  const searchResults = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    Object.values(products).forEach(arr => {
      arr.forEach(p => {
        if (p.name.toLowerCase().includes(q)) results.push(p);
      });
    });
    return results;
  })();

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
    setOrderNumber(`ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    setShowConfirmDialog(true);
  };

  const confirmOrder = () => {
    alert(`Pedido enviado a cocina\nMesa: ${selectedTable}\nToken: ${token}\nTotal: $${total.toFixed(2)}`);
    setShowConfirmDialog(false);
    setCart([]);
    setCustomerName('');
    setSpecialNotes('');
  };

  return (
    <>
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
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
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
        <div style={{
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
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSelectedSubcategory(null);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedCategory === cat.name ? '#000000' : '#f5f5f5',
                  color: selectedCategory === cat.name ? '#ffffff' : '#111',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Subcategorías */}
          {categories.find(c => c.name === selectedCategory)?.subcategories.length > 0 && (
            <div style={{
              marginBottom: '24px',
              paddingBottom: '20px',
              borderBottom: '1px solid #e5e5e5'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '12px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Selecciona una opción
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.find(c => c.name === selectedCategory).subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: selectedSubcategory === sub ? '2px solid #000' : '1px solid #e5e5e5',
                      background: selectedSubcategory === sub ? '#f9f9f9' : 'white',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: selectedSubcategory === sub ? '600' : '400'
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Productos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {searchQuery.trim() ? (
              // Render search results (flat list)
              searchResults.length === 0 ? (
                <div style={{ gridColumn: '1/-1', color: '#666', padding: 16 }}>No se encontraron productos para "{searchQuery}"</div>
              ) : (
                searchResults.map((product, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{product.name}</div>
                    {product.price != null && <div style={{ fontSize: '16px', fontWeight: '700', color: '#000', marginBottom: '12px' }}>${product.price.toFixed(2)}</div>}
                    <button onClick={() => addToCart(product)} style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: '#000',
                      color: 'white',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>+ Agregar</button>
                  </div>
                ))
              )
            ) : (
              // Default rendering by category/subcategory
              <>
                {selectedCategory === 'Bebidas' && (
                  // If a subcategory is selected, show only that one, otherwise show all
                  (selectedSubcategory ? [[selectedSubcategory, bebidasGrouped[selectedSubcategory] || []]] : Object.entries(bebidasGrouped)).map(([subcategory, flavors], idx) => (
                    <div key={subcategory + '-' + idx} style={{
                      background: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        {subcategory}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <select
                          onChange={(e) => setSelectedFlavor(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e5e5',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">Seleccionar sabor</option>
                          {flavors.map((flavor, flavorIdx) => (
                            <option key={flavorIdx} value={flavor}>{flavor}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedFlavor) {
                            addToCart({ name: selectedFlavor, price: 30, category: 'Bebidas' });
                          } else {
                            alert('Por favor seleccione un sabor');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          background: '#000',
                          color: 'white',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        + Agregar
                      </button>
                    </div>
                  ))
                )}

                {selectedCategory === 'Platillos' && (
                  // Determine which subcategories to render: selected only, or all
                  (selectedSubcategory ? [selectedSubcategory] : categories.find(c => c.name === 'Platillos').subcategories).map((sub, subIdx) => (
                    (products[sub] || []).map((product, idx) => (
                      <div key={sub + '-' + idx} style={{
                        background: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        padding: '16px'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                          {product.name}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <select
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '6px',
                              border: '1px solid #e5e5e5',
                              fontSize: '14px'
                            }}
                          >
                            {platillosSizes.map((size, sizeIdx) => (
                              <option key={sizeIdx} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            background: '#000',
                            color: 'white',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          + Agregar
                        </button>
                      </div>
                    ))
                  ))
                )}

                {selectedCategory === 'Postres' && (
                  (selectedSubcategory ? [selectedSubcategory] : categories.find(c => c.name === 'Postres').subcategories).map((sub, subIdx) => (
                    (products[sub] || []).map((product, idx) => (
                      <div key={sub + '-' + idx} style={{
                        background: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        padding: '16px'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#000', marginBottom: '12px' }}>
                          ${product.price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            background: '#000',
                            color: 'white',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          + Agregar
                        </button>
                      </div>
                    ))
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Panel derecho - Pedido */}
        <div style={{
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {tables.map(table => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: selectedTable === table ? '2px solid #000' : '1px solid #e5e5e5',
                    background: selectedTable === table ? '#f0f0f0' : 'white',
                    fontSize: '14px',
                    fontWeight: selectedTable === table ? '700' : '400',
                    cursor: 'pointer'
                  }}
                >
                  {table}
                </button>
              ))}
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
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none'
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
              placeholder="ej. sin cebolla, término medio"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                minHeight: '60px',
                resize: 'none'
              }}
            />
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
              {specialNotes.length}/200
            </div>
          </div>

          {/* Items del carrito */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', minHeight: '200px' }}>
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
                background: cart.length === 0 || !selectedTable || !customerName ? '#e5e5e5' : '#000',
                color: cart.length === 0 || !selectedTable || !customerName ? '#999' : 'white',
                border: 'none',
                cursor: cart.length === 0 || !selectedTable || !customerName ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px'
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [showTokenInHeader, setShowTokenInHeader] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [activeTab, setActiveTab] = useState('crear-orden');
  const navigate = useNavigate();
  const [verOrdersSignal, setVerOrdersSignal] = useState(0);

  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState('');
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

  // Persist waiter name in session so other pages (VerOrdenes) can validate permissions
  React.useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('waiterName', waiterName);
    } else {
      sessionStorage.removeItem('waiterName');
    }
  }, [isAuthenticated, waiterName]);

  // Restore existing waiter from session if present. Do NOT auto-create a dummy waiter on mount.
  // This ensures the "Bienvenido Mesero" token prompt shows when navigating here from login.
  React.useEffect(() => {
    const existing = sessionStorage.getItem('waiterName');
    if (existing) {
      // restore session waiter (keep authenticated)
      setWaiterName(existing);
      setIsAuthenticated(true);
    } else {
      // No session: leave not authenticated so token input is displayed.
      setIsAuthenticated(false);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5' }}>
        <div style={{ width: 380, padding: 24, background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {/* Back button above the login card */}
          <BackButton onClick={() => navigate('/')} label="Regresar" />
          <h2 style={{ margin: '0 0 20px 0' }}>Bienvenido Mesero</h2>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Token</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showTokenInput ? 'text' : 'password'}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Ingresa tu token"
                style={{ width: '100%', padding: '8px 40px 8px 8px', marginTop: 8, borderRadius: 6, border: '1px solid #e5e5e5' }}
              />
              <button
                type="button"
                onClick={() => setShowTokenInput(s => !s)}
                aria-label={showTokenInput ? 'Ocultar token' : 'Mostrar token'}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 4
                }}
              >
                {showTokenInput ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button onClick={handleLogin} style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 8, background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#f5f5f5' }}>
      <div style={{ flex: 1, background: '#fff', padding: 20, overflowY: 'auto', borderRight: '1px solid #e5e5e5' }}>
        {/* Header (preserve) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
            <div>
              <div style={{ fontWeight: 700 }}>Mesero: {waiterName}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{showTokenInHeader ? `Token: ${token}` : 'Token: •••••'}</div>
            </div>
          </div>
          <button onClick={() => { setIsAuthenticated(false); setToken(''); setWaiterName(''); }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e5e5', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Salir</button>
        </div>

        {/* Tab bar (preserve) */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 12px', background: '#f9f9f9', borderBottom: '1px solid #e5e5e5', marginBottom: 20, borderRadius: 8 }}>
          <button onClick={() => setActiveTab('crear-orden')} style={{ padding: '8px 14px', borderRadius: 14, background: activeTab === 'crear-orden' ? '#e6f0ff' : 'transparent', border: activeTab === 'crear-orden' ? '1px solid #cfe0ff' : 'none', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontWeight: activeTab === 'crear-orden' ? 600 : 400 }}><span style={{ fontSize: 16 }}>🛒</span><span>Crear Orden</span></button>
          <button onClick={() => { setActiveTab('ver-ordenes'); setVerOrdersSignal(s => s + 1); }} style={{ padding: '8px 14px', borderRadius: 14, background: activeTab === 'ver-ordenes' ? '#e6f0ff' : 'transparent', border: activeTab === 'ver-ordenes' ? '1px solid #cfe0ff' : 'none', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontWeight: activeTab === 'ver-ordenes' ? 600 : 400 }}><span style={{ fontSize: 16 }}>👁️</span><span>Ver Órdenes</span></button>
          <button onClick={() => setActiveTab('cuenta-mesa')} style={{ padding: '8px 14px', borderRadius: 14, background: activeTab === 'cuenta-mesa' ? '#e6f0ff' : 'transparent', border: activeTab === 'cuenta-mesa' ? '1px solid #cfe0ff' : 'none', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontWeight: activeTab === 'cuenta-mesa' ? 600 : 400 }}><span style={{ fontSize: 16 }}>🎟️</span><span>Cuenta Mesa</span></button>
          <button onClick={() => setActiveTab('cerrar-mesa')} style={{ padding: '8px 14px', borderRadius: 14, background: activeTab === 'cerrar-mesa' ? '#e6f0ff' : 'transparent', border: activeTab === 'cerrar-mesa' ? '1px solid #cfe0ff' : 'none', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontWeight: activeTab === 'cerrar-mesa' ? 600 : 400 }}><span style={{ fontSize: 16 }}>💲</span><span>Cerrar Mesa</span></button>
          <button onClick={() => setActiveTab('solicitar-cancelacion')} style={{ padding: '8px 14px', borderRadius: 14, background: activeTab === 'solicitar-cancelacion' ? '#e6f0ff' : 'transparent', border: activeTab === 'solicitar-cancelacion' ? '1px solid #cfe0ff' : 'none', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontWeight: activeTab === 'solicitar-cancelacion' ? 600 : 400 }}><span style={{ fontSize: 16 }}>❌</span><span>Cancelación</span></button>
        </div>

        {/* Content area */}
        {activeTab === 'ver-ordenes' ? (
          <VerOrdenes currentWaiter={waiterName} openSignal={verOrdersSignal} />
        ) : activeTab === 'cuenta-mesa' ? (
          <CuentaMesa />
        ) : activeTab === 'cerrar-mesa' ? (
          <CerrarMesa />
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
            specialNotes={specialNotes}
            setSpecialNotes={setSpecialNotes}
            total={total}
            showConfirmDialog={showConfirmDialog}
            setShowConfirmDialog={setShowConfirmDialog}
            orderNumber={orderNumber}
            setOrderNumber={setOrderNumber}
            token={token}
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
  );
}