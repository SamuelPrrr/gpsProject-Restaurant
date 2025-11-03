 import React, { useState } from 'react';
import { Users, ShoppingCart, BarChart, Settings, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  // UI-only user management state (in-memory prototype)
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    secondLastName: '',
    role: 'Mesero',
    password: '',
    token: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', secondLastName: '', role: 'Mesero', password: '', token: '' });
    setFormError('');
    setFormSuccess('');
    setEditingUser(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const generateIdentifier = () => {
    // simple auto-generated identifier
    return 'USR-' + Date.now().toString().slice(-6);
  };

  const validateForm = () => {
    // All fields mandatory
    if (!form.firstName.trim() || !form.lastName.trim() || !form.secondLastName.trim() || !form.role) {
      setFormError('Por favor completa todos los campos obligatorios.');
      return false;
    }
    if (form.role === 'Administrador') {
      // password must be numeric and 5 digits
      if (!/^[0-9]{5}$/.test(form.password)) {
        setFormError('La contraseña para administradores debe ser numérica y tener 5 dígitos.');
        return false;
      }
    }
    if (form.role === 'Mesero') {
      if (!form.token.trim()) { setFormError('El token es obligatorio para meseros.'); return false; }
      // token uniqueness
      const dup = users.find(u => u.token === form.token && (!editingUser || u.id !== editingUser.id));
      if (dup) { setFormError('El token ya está en uso por otro usuario.'); return false; }
    }
    // duplicate full name check
    const nameDup = users.find(u => u.firstName.toLowerCase() === form.firstName.trim().toLowerCase() && u.lastName.toLowerCase() === form.lastName.trim().toLowerCase() && u.secondLastName.toLowerCase() === form.secondLastName.trim().toLowerCase() && (!editingUser || u.id !== editingUser.id));
    if (nameDup) { setFormError('Ya existe un usuario con el mismo nombre completo.'); return false; }
    return true;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setFormError(''); setFormSuccess('');
    if (!validateForm()) { return; }
    if (editingUser) {
      // update
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form } : u));
      setFormSuccess('Datos de usuario actualizados correctamente');
      setShowModal(false);
      resetForm();
      return;
    }
    // create
    const newUser = {
      id: generateIdentifier(),
      ...form
    };
    // ensure token uniqueness again
    if (newUser.token && users.find(u => u.token === newUser.token)) {
      setFormError('El token ya está en uso por otro usuario.');
      return;
    }
    setUsers(prev => [newUser, ...prev]);
    setFormSuccess('Usuario registrado exitosamente');
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ firstName: user.firstName, lastName: user.lastName, secondLastName: user.secondLastName, role: user.role, password: user.password || '', token: user.token || '' });
    setShowModal(true);
  };

  const handleDeleteConfirmed = () => {
    setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
    setConfirmDelete({ open: false, id: null });
  };

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">RestaurantPOS</div>
              <div className="hidden sm:block text-sm text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">Admin Dashboard</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/meseros')} 
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex rounded-xl bg-white shadow-md p-1 border border-gray-200">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === 'overview' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                📊 Resumen
              </button>
              <button 
                onClick={() => setActiveTab('users')} 
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === 'users' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                👥 Usuarios
              </button>
            </div>
          </div>

          {/* Content switcher */}
          {activeTab === 'overview' && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Meseros activos</div>
                  <div className="text-3xl font-bold text-gray-800 mt-1">12</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedidos hoy</div>
                  <div className="text-3xl font-bold text-gray-800 mt-1">84</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  <BarChart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ventas (hoy)</div>
                  <div className="text-3xl font-bold text-gray-800 mt-1">$3,420</div>
                </div>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Últimos pedidos</h3>
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">Actualizado hace 5 min</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b-2 border-gray-200">
                      <th className="py-3 px-4 rounded-tl-lg">#</th>
                      <th className="py-3 px-4">Mesa</th>
                      <th className="py-3 px-4">Mesero</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 rounded-tr-lg">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3,4,5].map(i => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors duration-150">
                        <td className="py-3.5 px-4 font-medium text-gray-700">ORD-00{i}</td>
                        <td className="py-3.5 px-4 text-gray-600">{i}</td>
                        <td className="py-3.5 px-4 text-gray-600">Mesero {i}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-800">${(i*20).toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Enviado</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Ajustes</h4>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <div className="font-medium">Modo mantenimiento</div>
                  <input type="checkbox" className="w-5 h-5 accent-orange-600 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <div className="font-medium">Notificaciones</div>
                  <input type="checkbox" className="w-5 h-5 accent-orange-600 cursor-pointer" defaultChecked />
                </div>
                <div className="pt-2">
                  <button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">Guardar cambios</button>
                </div>
              </div>
            </aside>
          </section>
          </>
          )}

          {activeTab === 'users' && (
            <div className="mt-0">
              {/* Usuarios management (UI only prototype) */}
              <div className="mt-0 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={openCreate} 
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  + Nuevo Usuario
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b-2 border-gray-200">
                    <th className="py-3 px-4 rounded-tl-lg">Identificador</th>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Token / Contraseña</th>
                    <th className="py-3 px-4 rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-medium">No hay usuarios registrados</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors duration-150">
                        <td className="py-3.5 px-4 font-medium text-gray-700">{u.id}</td>
                        <td className="py-3.5 px-4 text-gray-600">{u.firstName} {u.lastName} {u.secondLastName}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'Administrador' ? 'bg-purple-100 text-purple-700' : 
                            u.role === 'Mesero' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-600">{u.role === 'Mesero' ? u.token : (u.role === 'Administrador' ? '*****' : '')}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(u)} 
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1.5 font-medium transition-colors duration-150"
                            >
                              <Edit2 className="w-4 h-4"/>Editar
                            </button>
                            <button 
                              onClick={() => setConfirmDelete({ open: true, id: u.id })} 
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5 font-medium transition-colors duration-150"
                            >
                              <Trash2 className="w-4 h-4"/>Eliminar
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
          )}
          {/* Create / Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-bold text-gray-800">{editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h4>
                  <button 
                    onClick={() => { setShowModal(false); resetForm(); }} 
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-150"
                  >
                    ✕
                  </button>
                </div>
                {formError && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{formError}</div>}
                {formSuccess && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{formSuccess}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Nombre(s)</label>
                    <input 
                      value={form.firstName} 
                      onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Apellido Paterno</label>
                    <input 
                      value={form.lastName} 
                      onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Apellido Materno</label>
                    <input 
                      value={form.secondLastName} 
                      onChange={(e) => setForm(prev => ({ ...prev, secondLastName: e.target.value }))} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Rol</label>
                    <select 
                      value={form.role} 
                      onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150"
                    >
                      <option>Mesero</option>
                      <option>Administrador</option>
                      <option>Cocina</option>
                    </select>
                  </div>
                  {form.role === 'Administrador' && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">Contraseña (5 dígitos numéricos)</label>
                      <input 
                        value={form.password} 
                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
                      />
                    </div>
                  )}
                  {form.role === 'Mesero' && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">Token</label>
                      <input 
                        value={form.token} 
                        onChange={(e) => setForm(prev => ({ ...prev, token: e.target.value }))} 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-150" 
                      />
                    </div>
                  )}
                  <div className="md:col-span-2 flex items-center justify-end gap-3 mt-4 pt-4 border-t">
                    <button 
                      type="button" 
                      onClick={() => { setShowModal(false); resetForm(); }} 
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
          )}

          {/* Delete confirm modal */}
          {confirmDelete.open && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Confirmar eliminación</h4>
                  <p className="text-sm text-gray-600">¿Deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setConfirmDelete({ open: false, id: null })} 
                    className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteConfirmed} 
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 hover:shadow-lg transition-all duration-150"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
