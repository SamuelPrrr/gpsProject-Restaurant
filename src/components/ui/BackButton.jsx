import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'transparent',
        border: 'none',
        color: '#6b7280',
        fontSize: '14px',
        cursor: 'pointer',
        marginBottom: '24px',
        padding: '0',
      }}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}