import React from 'react';

export default function ProductModal({ 
  show, 
  onClose, 
  editingProduct, 
  form, 
  setForm, 
  formError, 
  formSuccess, 
  onSubmit 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-2xl font-bold text-gray-800">
            {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Nombre *
              </label>
              <input 
                value={form.name} 
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Categoría *
              </label>
              <select 
                value={form.category} 
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150"
                required
              >
                <option value="">Selecciona una categoría</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Entradas">Entradas</option>
                <option value="Platos Fuertes">Platos Fuertes</option>
                <option value="Postres">Postres</option>
                <option value="Ensaladas">Ensaladas</option>
                <option value="Sopas">Sopas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Descripción *
            </label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150 min-h-[100px]" 
              maxLength={300}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 300 caracteres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Precio *
              </label>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={form.price} 
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))} 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Disponible
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="available" 
                    checked={form.available === true}
                    onChange={() => setForm(prev => ({ ...prev, available: true }))}
                    className="w-4 h-4 accent-orange-600"
                  />
                  <span className="text-sm text-gray-700">Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="available" 
                    checked={form.available === false}
                    onChange={() => setForm(prev => ({ ...prev, available: false }))}
                    className="w-4 h-4 accent-orange-600"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              URL de Imagen
            </label>
            <input 
              type="url"
              value={form.imageUrl} 
              onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))} 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
