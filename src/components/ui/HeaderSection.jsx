import React from 'react';

export default function HeaderSection({ title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '8px',
      }}>
        {title}
      </h1>
      <p style={{
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '400',
      }}>
        {subtitle}
      </p>
    </div>
  );
}