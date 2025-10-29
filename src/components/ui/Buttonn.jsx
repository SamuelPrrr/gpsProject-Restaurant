import React from 'react';

export default function Button({ onClick, children, disabled, style, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        padding: '14px',
        borderRadius: '10px',
        background: disabled ? '#00000099' : '#000000',
        color: '#ffffff',
        border: 'none',
        fontWeight: '700',
        fontSize: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? '0.6' : '1',
        ...style,
      }}
    >
      {children}
    </button>
  );
}