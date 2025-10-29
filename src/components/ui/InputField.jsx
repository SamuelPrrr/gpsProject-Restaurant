import React from 'react';

export default function InputField({ label, type, value, onChange, placeholder, icon: Icon, required }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none',
            }}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            padding: Icon ? '12px 16px 12px 48px' : '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e6e9ef',
            fontSize: '14px',
            color: '#111827',
            background: '#f7fafc',
            transition: 'all 0.15s ease',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#111827';
            e.target.style.background = '#ffffff';
            e.target.style.boxShadow = '0 0 0 4px rgba(56,189,248,0.06)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e6e9ef';
            e.target.style.background = '#f7fafc';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}