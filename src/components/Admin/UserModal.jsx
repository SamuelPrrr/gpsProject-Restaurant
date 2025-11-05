import React from 'react';

export default function UserModal({ 
  show, 
  onClose, 
  editingUser, 
  form, 
  setForm, 
  formError, 
  formSuccess, 
  onSubmit 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-2xl font-bold text-gray-800">
            {editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
          </h4>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-150"
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {formError}
          </div>
        )}
        
        {formSuccess && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
            {formSuccess}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Nombre(s) *
            </label>
            <input 
              value={form.firstName} 
              onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Apellido Paterno *
            </label>
            <input 
              value={form.lastName} 
              onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Identificador *
            </label>
            <input 
              value={form.identifier} 
              onChange={(e) => setForm(prev => ({ ...prev, identifier: e.target.value }))} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
              disabled={!!editingUser}
              required
            />
            {editingUser && (
              <p className="text-xs text-gray-500 mt-1">El identificador no puede modificarse</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Rol *
            </label>
            <select 
              value={form.role} 
              onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150"
              required
            >
              <option value="waiter">Mesero</option>
              <option value="kitchen">Cocina</option>
              <option value="administrator">Administrador</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-4 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              {editingUser ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
