import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function ProductsTab({
  products,
  loading,
  onOpenCreate,
  onEdit,
  onDelete,
  formError
}) {
  const categoryLabels = {
    bebidas: 'Bebidas',
    entradas: 'Entradas',
    platos_fuertes: 'Platos Fuertes',
    postres: 'Postres',
    ensaladas: 'Ensaladas',
    sopas: 'Sopas'
  };

  return (
    <div className='mt-0'>
      {formError && (
        <div className='mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg'>
          {formError}
        </div>
      )}

      <div className='mt-0 bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-bold text-gray-800'>
            Gestión de Productos
          </h3>
          <div className='flex items-center gap-2'>
            <button
              onClick={onOpenCreate}
              disabled={loading}
              className='px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              + Nuevo Producto
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm table-auto'>
            <thead>
              <tr className='text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b-2 border-gray-200'>
                <th className='py-3 px-4 rounded-tl-lg'>Nombre</th>
                <th className='py-3 px-4'>Descripción</th>
                <th className='py-3 px-4'>Precio</th>
                <th className='py-3 px-4'>Categoría</th>
                <th className='py-3 px-4'>Disponible</th>
                <th className='py-3 px-4 rounded-tr-lg'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className='py-12 text-center text-gray-400 font-medium'
                  >
                    Cargando...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='py-12 text-center text-gray-400 font-medium'
                  >
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className='border-b border-gray-100 hover:bg-orange-50/30 transition-colors duration-150'
                  >
                    <td className='py-3.5 px-4 font-medium text-gray-700'>
                      {product.name}
                    </td>
                    <td className='py-3.5 px-4 text-gray-600 max-w-xs truncate'>
                      {product.description}
                    </td>
                    <td className='py-3.5 px-4 font-semibold text-gray-800'>
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className='py-3.5 px-4'>
                      <span className='px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700'>
                        {categoryLabels[product.category] || product.category}
                      </span>
                    </td>
                    <td className='py-3.5 px-4'>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.available ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className='py-3.5 px-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => onEdit(product)}
                          disabled={loading}
                          className='px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1.5 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <Edit2 className='w-4 h-4' />
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          disabled={loading}
                          className='px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <Trash2 className='w-4 h-4' />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
