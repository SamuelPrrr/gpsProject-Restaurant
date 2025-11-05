import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ show, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">
            Confirmar eliminación
          </h4>
          <p className="text-sm text-gray-600">
            ¿Deseas eliminar este usuario? Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 hover:shadow-lg transition-all duration-150"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
