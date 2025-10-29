import React from 'react';

export default function CardLayout({ children }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '520px',
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
      padding: '40px',
    }}>
      {children}
    </div>
  );
}