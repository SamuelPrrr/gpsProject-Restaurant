import React, { useState } from 'react';
import { X, Lock, AlertTriangle } from 'lucide-react';

export default function SolicitarCancelacion() {
  const [folioNumber, setFolioNumber] = useState('');
  const [reason, setReason] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = () => {
    if (!folioNumber.trim()) {
      alert('Por favor ingrese el número de folio');
      return;
    }
    if (reason.trim().length < 10) {
      alert('La razón de cancelación debe tener al menos 10 caracteres');
      return;
    }
    if (!adminUser.trim() || !adminPassword.trim()) {
      alert('Debe proporcionar las credenciales de autorización del administrador');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    // Simulated validation - in real implementation, verify against database
    if (adminUser !== 'admin' || adminPassword !== '12345') {
      alert('Autorización incorrecta. Cancelación no realizada');
      setShowConfirmDialog(false);
      return;
    }

    // Success message per requirements
    alert(`Cuenta ${folioNumber} cancelada correctamente\n\nMesa reabierta. Los productos están nuevamente disponibles en la cuenta\n\nNota: El folio ${folioNumber} ha sido marcado como CANCELADO y no podrá ser reutilizado.`);
    setShowConfirmDialog(false);
    setFolioNumber('');
    setReason('');
    setAdminUser('');
    setAdminPassword('');
  };

  return (
    <>
      {/* Confirmation Dialog */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#ef4444" />
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                Confirmar Cancelación
              </h2>
            </div>
            
            <div style={{
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>
                ⚠️ Esta acción es irreversible. ¿Confirma la cancelación de la cuenta {folioNumber}?
              </p>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
              <p style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>Folio:</strong> {folioNumber}
              </p>
              <p style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>Razón:</strong> {reason}
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>Autorizado por:</strong> {adminUser}
              </p>
            </div>

            <div style={{
              padding: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#1e40af'
            }}>
              <strong>Efectos de la cancelación:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>La cuenta se marcará como CANCELADA (no se elimina)</li>
                <li>El folio {folioNumber} no podrá ser reutilizado</li>
                <li>La mesa se reabrirá automáticamente</li>
                <li>Los productos regresarán como "pendientes de pago"</li>
              </ul>
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
                onClick={handleConfirm}
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

      {/* Main Content */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '24px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '16px',
          color: '#111'
        }}>
          Cancelar Cuenta
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          Esta operación requiere autorización de gerente/administrador. La cuenta se marcará como CANCELADA y el folio no podrá ser reutilizado.
        </p>

        {/* Info Alert */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#fef9c3',
          border: '1px solid #fde047',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#854d0e',
          lineHeight: '1.5',
          display: 'flex',
          gap: '12px',
          alignItems: 'start'
        }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Importante:</strong> Las cuentas canceladas no se eliminan del sistema, se marcan como "CANCELADAS". 
            La mesa se reabrirá automáticamente y todos los productos regresarán como "pendientes de pago".
          </div>
        </div>

        {/* Folio Number */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#111'
          }}>
            Número de Folio <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={folioNumber}
            onChange={(e) => setFolioNumber(e.target.value)}
            placeholder="Ej: FOL-20251025-001"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              outline: 'none',
              background: '#f9f9f9'
            }}
          />
        </div>

        {/* Reason */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#111'
          }}>
            Razón de Cancelación <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explique el motivo de la cancelación (mínimo 10 caracteres)"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              outline: 'none',
              background: '#f9f9f9',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.5'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#999',
            marginTop: '6px'
          }}>
            <span>{reason.length}/10 caracteres mínimos</span>
          </div>
        </div>

        {/* Authorization Section */}
        <div style={{
          marginBottom: '32px',
          padding: '20px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Lock size={18} />
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Autorización del Administrador
            </h3>
          </div>

          {/* Admin User */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#111'
            }}>
              Usuario Administrador <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              placeholder="Ingrese usuario del administrador"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                background: 'white'
              }}
            />
          </div>

          {/* Admin Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#111'
            }}>
              Contraseña del Administrador <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Ingrese contraseña del administrador"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                background: 'white'
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!folioNumber.trim() || reason.trim().length < 10 || !adminUser.trim() || !adminPassword.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            background: (!folioNumber.trim() || reason.trim().length < 10 || !adminUser.trim() || !adminPassword.trim()) ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            cursor: (!folioNumber.trim() || reason.trim().length < 10 || !adminUser.trim() || !adminPassword.trim()) ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            if (folioNumber.trim() && reason.trim().length >= 10 && adminUser.trim() && adminPassword.trim()) {
              e.target.style.background = '#b91c1c';
            }
          }}
          onMouseLeave={(e) => {
            if (folioNumber.trim() && reason.trim().length >= 10 && adminUser.trim() && adminPassword.trim()) {
              e.target.style.background = '#dc2626';
            }
          }}
        >
          <X size={18} />
          Cancelar Cuenta
        </button>

        {/* Info Box */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1e40af',
          lineHeight: '1.5'
        }}>
          <strong>Nota:</strong> Esta operación requiere autorización de gerente/administrador. 
          La cuenta será marcada como CANCELADA (no se elimina físicamente), el folio no podrá ser reutilizado, 
          la mesa se reabrirá automáticamente y todos los productos regresarán como "pendientes de pago".
        </div>
      </div>
    </>
  );
}