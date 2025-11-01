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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold text-orange-600">RestaurantPOS</div>
              <div className="text-sm text-gray-500">Admin Dashboard</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/meseros')} className="px-3 py-1 rounded-md bg-white border text-sm">Volver</button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="mb-6">
            <div className="inline-flex rounded-md bg-white shadow-sm">
              <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'text-gray-700'}`}>Resumen</button>
              <button onClick={() => setActiveTab('users')} className={`px-4 py-2 ${activeTab === 'users' ? 'bg-orange-600 text-white' : 'text-gray-700'}`}>Usuarios</button>
            </div>
          </div>

          {/* Content switcher */}
          {activeTab === 'overview' && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-md">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Meseros activos</div>
                <div className="text-2xl font-semibold">12</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-md">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Pedidos hoy</div>
                <div className="text-2xl font-semibold">84</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-md">
                <BarChart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Ventas (hoy)</div>
                <div className="text-2xl font-semibold">$3,420</div>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Últimos pedidos</h3>
                <div className="text-sm text-gray-500">Actualizado hace 5 min</div>
              </div>
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="py-2">#</th>
                    <th className="py-2">Mesa</th>
                    <th className="py-2">Mesero</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5].map(i => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3">ORD-00{i}</td>
                      <td className="py-3">{i}</td>
                      <td className="py-3">Mesero {i}</td>
                      <td className="py-3">${(i*20).toFixed(2)}</td>
                      <td className="py-3"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Enviado</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold">Ajustes</h4>
                <Settings className="w-4 h-4 text-gray-500" />
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <div>Modo mantenimiento</div>
                  <input type="checkbox" className="accent-orange-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>Notificaciones</div>
                  <input type="checkbox" className="accent-orange-600" defaultChecked />
                </div>
                <div>
                  <button className="w-full mt-2 bg-orange-600 text-white px-3 py-2 rounded-md">Guardar</button>
                </div>
              </div>
            </aside>
          </section>
          </>
          )}

          {activeTab === 'users' && (
            <div className="mt-0">
              {/* Usuarios management (UI only prototype) */}
              <div className="mt-0 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
              <div className="flex items-center gap-2">
                <button onClick={openCreate} className="px-3 py-2 bg-orange-600 text-white rounded-md">Nuevo Usuario</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="py-2">Identificador</th>
                    <th className="py-2">Nombre</th>
                    <th className="py-2">Rol</th>
                    <th className="py-2">Token / Contraseña</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-gray-500">No hay usuarios registrados</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{u.id}</td>
                        <td className="py-3">{u.firstName} {u.lastName} {u.secondLastName}</td>
                        <td className="py-3">{u.role}</td>
                        <td className="py-3">{u.role === 'Mesero' ? u.token : (u.role === 'Administrador' ? '*****' : '')}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(u)} className="px-2 py-1 rounded bg-blue-50 text-blue-600 flex items-center gap-1"><Edit2 className="w-4 h-4"/>Editar</button>
                            <button onClick={() => setConfirmDelete({ open: true, id: u.id })} className="px-2 py-1 rounded bg-red-50 text-red-600 flex items-center gap-1"><Trash2 className="w-4 h-4"/>Eliminar</button>
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
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500">Cerrar</button>
                </div>
                {formError && <div className="mb-2 text-sm text-red-600">{formError}</div>}
                {formSuccess && <div className="mb-2 text-sm text-green-600">{formSuccess}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Nombre(s)</label>
                    <input value={form.firstName} onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Apellido Paterno</label>
                    <input value={form.lastName} onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Apellido Materno</label>
                    <input value={form.secondLastName} onChange={(e) => setForm(prev => ({ ...prev, secondLastName: e.target.value }))} className="w-full mt-1 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rol</label>
                    <select value={form.role} onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))} className="w-full mt-1 p-2 border rounded">
                      <option>Mesero</option>
                      <option>Administrador</option>
                      <option>Cocina</option>
                    </select>
                  </div>
                  {form.role === 'Administrador' && (
                    <div>
                      <label className="text-sm font-medium">Contraseña (5 dígitos numéricos)</label>
                      <input value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} className="w-full mt-1 p-2 border rounded" />
                    </div>
                  )}
                  {form.role === 'Mesero' && (
                    <div>
                      <label className="text-sm font-medium">Token</label>
                      <input value={form.token} onChange={(e) => setForm(prev => ({ ...prev, token: e.target.value }))} className="w-full mt-1 p-2 border rounded" />
                    </div>
                  )}
                  <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-3 py-2 border rounded">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded">{editingUser ? 'Guardar cambios' : 'Crear usuario'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete confirm modal */}
          {confirmDelete.open && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
                <h4 className="text-lg font-semibold mb-2">Confirmar eliminación</h4>
                <p className="text-sm text-gray-600 mb-4">¿Deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setConfirmDelete({ open: false, id: null })} className="px-3 py-2 border rounded">Cancelar</button>
                  <button onClick={handleDeleteConfirmed} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
