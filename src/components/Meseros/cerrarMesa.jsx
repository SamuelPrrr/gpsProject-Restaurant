import React, { useState } from 'react';

export default function CerrarMesa() {
  const [mesa, setMesa] = useState('');
  const [cliente, setCliente] = useState('');
  const [total, setTotal] = useState(null);

  const handleGenerate = () => {
    // Dummy behavior: compute a fake total for demo/testing
    const numeric = parseInt(mesa.toString().replace(/[^0-9]/g, ''), 10) || 1;
    const computed = (numeric * 23.5).toFixed(2); // simple formula for testing
    setTotal(computed);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e6e6e6' }}>
        <h2 style={{ marginTop: 0 }}>Cerrar Mesa y Generar Cuenta</h2>

        <div style={{ display: 'flex', gap: 12, marginTop: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Mesa</label>
            <input value={mesa} onChange={e => setMesa(e.target.value)} placeholder="Número de mesa" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e5e5' }} />
          </div>
          <div style={{ flex: 2 }}>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleGenerate} style={{ padding: '10px 16px', background: '#000', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Iniciar cierre de mesa</button>
          {total && (
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontSize: 12, color: '#666' }}>Iniciar cierre de mesa</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>${total}</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 18, color: '#666' }}>
         
        </div>
      </div>
    </div>
  );
}
