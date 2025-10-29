import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';

export default function ConsultarCuentaMesa() {
  const [tableNumber, setTableNumber] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual database query
  const mockOrders = {
    3: [
      {
        folio: 'FOL-20251025-002',
        date: '25/10/2025',
        time: '14:25:38',
        status: 'En Preparación',
        waiter: 'Mesero 001',
        openTime: '14:20:15',
        products: [
          { name: 'Cerveza corona x3', quantity: 3, unitPrice: 40, subtotal: 120 },
          { name: 'Orden de mojarras botaneras x1', quantity: 1, unitPrice: 70, subtotal: 70 },
          { name: 'Jarra de agua 3lts (tamarindo) x1', quantity: 1, unitPrice: 80, subtotal: 80 }
        ]
      }
    ],
    5: [
      {
        folio: 'FOL-20251025-003',
        date: '25/10/2025',
        time: '15:10:22',
        status: 'Listo',
        waiter: 'Mesero 002',
        openTime: '15:05:00',
        products: [
          { name: 'Tacos de Asada x2', quantity: 2, unitPrice: 60, subtotal: 120 },
          { name: 'Coca Zero x2', quantity: 2, unitPrice: 30, subtotal: 60 }
        ]
      }
    ]
  };

  const handleSearch = () => {
    if (!tableNumber.trim()) {
      alert('Por favor ingrese un número de mesa');
      return;
    }

    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 20) {
      alert('El número de mesa debe estar entre 1 y 20');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const orders = mockOrders[tableNum];
      
      if (!orders || orders.length === 0) {
        setSearchResults({ tableNumber: tableNum, orders: [], exists: true });
        alert(`La mesa ${tableNum} no tiene productos ordenados`);
      } else {
        setSearchResults({ tableNumber: tableNum, orders });
      }
      
      setIsLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setTableNumber('');
    setSearchResults(null);
  };

  const calculateTotal = () => {
    if (!searchResults || !searchResults.orders) return 0;
    return searchResults.orders.reduce((total, order) => {
      return total + order.products.reduce((orderTotal, product) => orderTotal + product.subtotal, 0);
    }, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En Preparación':
        return '#3b82f6';
      case 'Listo':
        return '#10b981';
      case 'Nuevo':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '24px'
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '24px',
        color: '#111'
      }}>
        Consultar Cuenta de Mesa
      </h1>

      {/* Search Section */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        marginBottom: '24px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#111'
        }}>
          Número de Mesa
        </label>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Ej: 3"
            min="1"
            max="20"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              outline: 'none',
              background: '#f9f9f9'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          <button
            onClick={handleSearch}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: isLoading ? '#9ca3af' : '#000',
              color: 'white',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <Search size={18} />
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'white',
              color: '#666',
              border: '1px solid #e5e5e5',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Results Section */}
      {searchResults && searchResults.orders.length > 0 && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              margin: 0
            }}>
              Mesa {searchResults.tableNumber}
            </h2>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              {searchResults.orders.length} orden{searchResults.orders.length !== 1 ? 'es' : ''}
            </div>
          </div>

          {searchResults.orders.map((order, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: idx < searchResults.orders.length - 1 ? '24px' : '0',
                paddingBottom: idx < searchResults.orders.length - 1 ? '24px' : '0',
                borderBottom: idx < searchResults.orders.length - 1 ? '1px solid #f0f0f0' : 'none'
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
                    {order.folio}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {order.date}, {order.time}
                  </div>
                </div>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: `${getStatusColor(order.status)}15`,
                    color: getStatusColor(order.status)
                  }}
                >
                  {order.status}
                </div>
              </div>

              {/* Order Details */}
              <div style={{
                background: '#fafafa',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#666' }}>
                  <div>
                    <strong style={{ color: '#111' }}>Mesero:</strong> {order.waiter}
                  </div>
                  <div>
                    <strong style={{ color: '#111' }}>Hora de apertura:</strong> {order.openTime}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div style={{ marginBottom: '16px' }}>
                {order.products.map((product, productIdx) => (
                  <div
                    key={productIdx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: productIdx < order.products.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {product.name}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      textAlign: 'right'
                    }}>
                      ${product.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
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
                <span>${order.products.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}</span>
              </div>
            </div>
          ))}

          {/* Total General */}
          <div style={{
            marginTop: '24px',
            padding: '16px 20px',
            background: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '700'
            }}>
              Total General:
            </span>
            <span style={{
              fontSize: '20px',
              fontWeight: '700'
            }}>
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchResults && searchResults.orders.length === 0 && (
        <div style={{
          background: 'white',
          padding: '48px 24px',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🍽️
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111',
            marginBottom: '8px'
          }}>
            Mesa {searchResults.tableNumber} disponible
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666'
          }}>
            No hay productos ordenados en esta mesa
          </div>
        </div>
      )}

      {/* Info Box */}
      {!searchResults && (
        <div style={{
          padding: '16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1e40af',
          lineHeight: '1.5'
        }}>
          <strong>Nota:</strong> Ingrese el número de mesa para consultar el estado actual de su cuenta. 
          Se mostrarán todos los productos ordenados y el monto total a pagar en tiempo real.
        </div>
      )}
    </div>
  );
}