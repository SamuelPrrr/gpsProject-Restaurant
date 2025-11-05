import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, BarChart, Settings, Trash2, Edit2, User, UserCog, ChartBarIncreasingIcon, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import UserModal from '../components/Admin/UserModal';
import ProductModal from '../components/Admin/ProductModal';
import ProductsTab from '../components/Admin/ProductsTab';
import DeleteConfirmModal from '../components/Admin/DeleteConfirmModal';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    identifier: '',
    role: 'waiter'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Products state
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    imageUrl: ''
  });
  const [productFormError, setProductFormError] = useState('');
  const [productFormSuccess, setProductFormSuccess] = useState('');
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState({ open: false, id: null });
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Fetch users on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'profile') {
      fetchProfileData();
    }
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching profile data...');
      console.log('API_ENDPOINTS.users:', API_ENDPOINTS.users);
      
      const response = await fetch(`${API_ENDPOINTS.users}/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Error al cargar datos del perfil');
      }
      
      const data = await response.json();
      console.log('Profile data received:', data);
      setProfileData(data);
      setProfileForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback a datos del currentUser si falla
      if (currentUser) {
        console.log('Using fallback currentUser:', currentUser);
        setProfileForm({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.users, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setFormError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.products, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductFormError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', identifier: '', role: 'waiter' });
    setFormError('');
    setFormSuccess('');
    setEditingUser(null);
  };

  const openCreate = () => { 
    resetForm(); 
    setShowModal(true); 
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormError(''); 
    setFormSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingUser 
        ? `${API_ENDPOINTS.users}/${editingUser.id}`
        : API_ENDPOINTS.users;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar usuario');
      }

      setFormSuccess(editingUser 
        ? 'Usuario actualizado correctamente' 
        : 'Usuario creado correctamente');
      
      // Refresh users list
      await fetchUsers();
      
      // Close modal after short delay
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1500);
    } catch (err) {
      console.error('Error saving user:', err);
      setFormError(err.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ 
      firstName: user.firstName, 
      lastName: user.lastName, 
      identifier: user.identifier, 
      role: user.role
    });
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.users}/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar usuario');
      }

      // Refresh users list
      await fetchUsers();
      setConfirmDelete({ open: false, id: null });
    } catch (err) {
      console.error('Error deleting user:', err);
      setFormError(err.message || 'Error al eliminar el usuario');
      setConfirmDelete({ open: false, id: null });
    } finally {
      setLoading(false);
    }
  };

  // Product handlers
  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', category: '', available: true, imageUrl: '' });
    setProductFormError('');
    setProductFormSuccess('');
    setEditingProduct(null);
  };

  const openCreateProduct = () => { 
    resetProductForm(); 
    setShowProductModal(true); 
  };

  const handleProductSubmit = async (e) => {
    e?.preventDefault();
    setProductFormError(''); 
    setProductFormSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingProduct 
        ? `${API_ENDPOINTS.products}/${editingProduct.id}`
        : API_ENDPOINTS.products;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar producto');
      }

      setProductFormSuccess(editingProduct 
        ? 'Producto actualizado correctamente' 
        : 'Producto creado correctamente');
      
      // Refresh products list
      await fetchProducts();
      
      // Close modal after short delay
      setTimeout(() => {
        setShowProductModal(false);
        resetProductForm();
      }, 1500);
    } catch (err) {
      console.error('Error saving product:', err);
      setProductFormError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({ 
      name: product.name, 
      description: product.description, 
      price: product.price, 
      category: product.category,
      available: product.available,
      imageUrl: product.imageUrl || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProductConfirmed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.products}/${confirmDeleteProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar producto');
      }

      // Refresh products list
      await fetchProducts();
      setConfirmDeleteProduct({ open: false, id: null });
    } catch (err) {
      console.error('Error deleting product:', err);
      setProductFormError(err.message || 'Error al eliminar el producto');
      setConfirmDeleteProduct({ open: false, id: null });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validations
    if (!profileForm.firstName || !profileForm.lastName) {
      setProfileError('Nombre y apellido son obligatorios');
      return;
    }

    if (profileForm.newPassword) {
      if (!profileForm.currentPassword) {
        setProfileError('Debe ingresar su contraseña actual para cambiarla');
        return;
      }
      if (profileForm.newPassword.length < 6) {
        setProfileError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileError('Las contraseñas no coinciden');
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName
      };

      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const response = await fetch(`${API_ENDPOINTS.users}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      // Update localStorage with new user data
      const updatedUser = { ...currentUser, firstName: profileForm.firstName, lastName: profileForm.lastName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfileSuccess('Perfil actualizado correctamente');
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Reload page after 1.5s to update context
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50'>
      <header className='bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-3'>
              <div className='text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent'>
                El Alevin - Servicio de comandas
              </div>
              {/* <div className='hidden sm:block text-sm text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full'>
                Admin Dashboard
              </div> */}
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className='px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow'
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Tabs */}
          <div className='mb-8'>
            <div className='inline-flex rounded-xl bg-white shadow-md p-1 border border-gray-200'>
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <ChartBarIncreasingIcon></ChartBarIncreasingIcon>
                Panel de control
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "products"
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Package />
                Productos
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "users"
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Users />
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <UserCog></UserCog>
                Mi Perfil
              </button>
            </div>
          </div>

          {/* Content switcher */}
          {activeTab === "overview" && (
            <>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group'>
                  <div className='flex items-center gap-4'>
                    <div className='p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300'>
                      <Users className='w-7 h-7 text-white' />
                    </div>
                    <div>
                      <div className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                        Meseros activos
                      </div>
                      <div className='text-3xl font-bold text-gray-800 mt-1'>
                        12
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group'>
                  <div className='flex items-center gap-4'>
                    <div className='p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300'>
                      <ShoppingCart className='w-7 h-7 text-white' />
                    </div>
                    <div>
                      <div className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                        Pedidos hoy
                      </div>
                      <div className='text-3xl font-bold text-gray-800 mt-1'>
                        84
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group'>
                  <div className='flex items-center gap-4'>
                    <div className='p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300'>
                      <BarChart className='w-7 h-7 text-white' />
                    </div>
                    <div>
                      <div className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                        Ventas (hoy)
                      </div>
                      <div className='text-3xl font-bold text-gray-800 mt-1'>
                        $3,420
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
                  <div className='flex items-center justify-between mb-6'>
                    <h3 className='text-xl font-bold text-gray-800'>
                      Últimos pedidos
                    </h3>
                    <div className='text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium'>
                      Actualizado hace 5 min
                    </div>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm table-auto'>
                      <thead>
                        <tr className='text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b-2 border-gray-200'>
                          <th className='py-3 px-4 rounded-tl-lg'>#</th>
                          <th className='py-3 px-4'>Mesa</th>
                          <th className='py-3 px-4'>Mesero</th>
                          <th className='py-3 px-4'>Total</th>
                          <th className='py-3 px-4 rounded-tr-lg'>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <tr
                            key={i}
                            className='border-b border-gray-100 hover:bg-orange-50/30 transition-colors duration-150'
                          >
                            <td className='py-3.5 px-4 font-medium text-gray-700'>
                              ORD-00{i}
                            </td>
                            <td className='py-3.5 px-4 text-gray-600'>{i}</td>
                            <td className='py-3.5 px-4 text-gray-600'>
                              Mesero {i}
                            </td>
                            <td className='py-3.5 px-4 font-semibold text-gray-800'>
                              ${(i * 20).toFixed(2)}
                            </td>
                            <td className='py-3.5 px-4'>
                              <span className='px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold'>
                                Enviado
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <aside className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-orange-100 rounded-lg'>
                      <Settings className='w-5 h-5 text-orange-600' />
                    </div>
                    <h4 className='text-lg font-bold text-gray-800'>Ajustes</h4>
                  </div>
                  <div className='space-y-4 text-sm text-gray-700'>
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150'>
                      <div className='font-medium'>Modo mantenimiento</div>
                      <input
                        type='checkbox'
                        className='w-5 h-5 accent-orange-600 cursor-pointer'
                      />
                    </div>
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150'>
                      <div className='font-medium'>Notificaciones</div>
                      <input
                        type='checkbox'
                        className='w-5 h-5 accent-orange-600 cursor-pointer'
                        defaultChecked
                      />
                    </div>
                    <div className='pt-2'>
                      <button className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200'>
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </aside>
              </section>
            </>
          )}

          {activeTab === "profile" && (
            <div className='max-w-5xl mx-auto'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Profile Card */}
                <div className='lg:col-span-1'>
                  <div className='bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-xl shadow-lg text-white'>
                    <div className='flex flex-col items-center text-center'>
                      <div className='w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-4 border-white/30'>
                        <User className='w-12 h-12 text-white' />
                      </div>
                      <h3 className='text-2xl font-bold mb-1'>
                        {profileData?.firstName || currentUser?.firstName}{" "}
                        {profileData?.lastName || currentUser?.lastName}
                      </h3>
                      <p className='text-orange-100 text-sm mb-4'>
                        Administrador
                      </p>
                      <div className='w-full pt-4 border-t border-white/20'>
                        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3'>
                          <p className='text-xs text-orange-100 mb-1'>
                            Identificador
                          </p>
                          <p className='font-mono font-semibold'>
                            {profileData?.identifier ||
                              currentUser?.identifier ||
                              "N/A"}
                          </p>
                        </div>
                        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-3'>
                          <p className='text-xs text-orange-100 mb-1'>Rol</p>
                          <p className='font-semibold'>
                            Administrador del Sistema
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className='lg:col-span-2'>
                  <div className='bg-white p-8 rounded-xl shadow-lg border border-gray-100'>
                    <div className='mb-6'>
                      <h3 className='text-2xl font-bold text-gray-800 mb-2'>
                        Información Personal
                      </h3>
                      <p className='text-sm text-gray-500'>
                        Actualiza tus datos y configura tu seguridad
                      </p>
                    </div>

                    {profileError && (
                      <div className='mb-6 p-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3'>
                        <span className='text-lg'>⚠️</span>
                        <span>{profileError}</span>
                      </div>
                    )}

                    {profileSuccess && (
                      <div className='mb-6 p-4 text-sm text-green-700 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start gap-3'>
                        <span className='text-lg'>✓</span>
                        <span>{profileSuccess}</span>
                      </div>
                    )}

                    <form
                      onSubmit={handleProfileSubmit}
                      className='space-y-8'
                    >
                      {/* Security Section */}
                      <div className='pt-6 border-t border-gray-200'>
                        <div className='flex items-center gap-2 mb-4'>
                          <div className='w-1 h-6 bg-gradient-to-b from-orange-600 to-orange-500 rounded-full'></div>
                          <h4 className='text-lg font-bold text-gray-800'>
                            Seguridad
                          </h4>
                        </div>
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                          <div className='flex items-start gap-3'>
                            <span className='text-xl'>🔒</span>
                            <div>
                              <p className='text-sm font-semibold text-blue-900 mb-1'>
                                Cambio de contraseña opcional
                              </p>
                              <p className='text-xs text-blue-700'>
                                Solo completa estos campos si deseas actualizar
                                tu contraseña. Dejarlos vacíos mantendrá tu
                                contraseña actual.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='space-y-4'>
                          <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                              Contraseña Actual
                            </label>
                            <input
                              type='password'
                              value={profileForm.currentPassword}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  currentPassword: e.target.value,
                                })
                              }
                              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white'
                              placeholder='Ingresa tu contraseña actual'
                            />
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Nueva Contraseña
                              </label>
                              <input
                                type='password'
                                value={profileForm.newPassword}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    newPassword: e.target.value,
                                  })
                                }
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white'
                                placeholder='Mínimo 6 caracteres'
                              />
                            </div>

                            <div>
                              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Confirmar Contraseña
                              </label>
                              <input
                                type='password'
                                value={profileForm.confirmPassword}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white'
                                placeholder='Repite la nueva contraseña'
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex gap-3 pt-6'>
                        <button
                          type='submit'
                          disabled={loading}
                          className='flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2'
                        >
                          {loading ? (
                            <>
                              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                              <span>Guardando...</span>
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              <span>Guardar Cambios</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <ProductsTab
              products={products}
              loading={loading}
              onOpenCreate={openCreateProduct}
              onEdit={handleEditProduct}
              onDelete={(id) => setConfirmDeleteProduct({ open: true, id })}
              formError={productFormError}
            />
          )}

          {activeTab === "users" && (
            <div className='mt-0'>
              {formError && !showModal && (
                <div className='mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg'>
                  {formError}
                </div>
              )}

              <div className='mt-0 bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-xl font-bold text-gray-800'>
                    Gestión de Usuarios
                  </h3>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={openCreate}
                      disabled={loading}
                      className='px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      + Nuevo Usuario
                    </button>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full text-sm table-auto'>
                    <thead>
                      <tr className='text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b-2 border-gray-200'>
                        <th className='py-3 px-4 rounded-tl-lg'>
                          Identificador
                        </th>
                        <th className='py-3 px-4'>Nombre</th>
                        <th className='py-3 px-4'>Rol</th>
                        <th className='py-3 px-4'>Token</th>
                        <th className='py-3 px-4 rounded-tr-lg'>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className='py-12 text-center text-gray-400 font-medium'
                          >
                            Cargando...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className='py-12 text-center text-gray-400 font-medium'
                          >
                            No hay usuarios registrados
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const roleLabels = {
                            administrator: "Administrador",
                            waiter: "Mesero",
                            kitchen: "Cocina",
                          };

                          return (
                            <tr
                              key={u.id}
                              className='border-b border-gray-100 hover:bg-orange-50/30 transition-colors duration-150'
                            >
                              <td className='py-3.5 px-4 font-medium text-gray-700'>
                                {u.identifier}
                              </td>
                              <td className='py-3.5 px-4 text-gray-600'>
                                {u.firstName} {u.lastName}
                              </td>
                              <td className='py-3.5 px-4'>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    u.role === "administrator"
                                      ? "bg-purple-100 text-purple-700"
                                      : u.role === "waiter"
                                      ? "bg-blue-100 text-blue-700"
                                      : u.role === "kitchen"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {roleLabels[u.role] || u.role}
                                </span>
                              </td>
                              <td className='py-3.5 px-4 font-mono text-gray-600'>
                                {u.token || "-"}
                              </td>
                              <td className='py-3.5 px-4'>
                                <div className='flex items-center gap-2'>
                                  <button
                                    onClick={() => handleEdit(u)}
                                    disabled={loading}
                                    className='px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1.5 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
                                  >
                                    <Edit2 className='w-4 h-4' />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() =>
                                      setConfirmDelete({ open: true, id: u.id })
                                    }
                                    disabled={loading}
                                    className='px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
                                  >
                                    <Trash2 className='w-4 h-4' />
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Create / Edit User Modal */}
          <UserModal
            show={showModal}
            onClose={() => {
              setShowModal(false);
              resetForm();
            }}
            editingUser={editingUser}
            form={form}
            setForm={setForm}
            formError={formError}
            formSuccess={formSuccess}
            onSubmit={handleSubmit}
          />

          {/* Create / Edit Product Modal */}
          <ProductModal
            show={showProductModal}
            onClose={() => {
              setShowProductModal(false);
              resetProductForm();
            }}
            editingProduct={editingProduct}
            form={productForm}
            setForm={setProductForm}
            formError={productFormError}
            formSuccess={productFormSuccess}
            onSubmit={handleProductSubmit}
          />

          {/* Delete User confirm modal */}
          <DeleteConfirmModal
            show={confirmDelete.open}
            onCancel={() => setConfirmDelete({ open: false, id: null })}
            onConfirm={handleDeleteConfirmed}
          />

          {/* Delete Product confirm modal */}
          <DeleteConfirmModal
            show={confirmDeleteProduct.open}
            onCancel={() => setConfirmDeleteProduct({ open: false, id: null })}
            onConfirm={handleDeleteProductConfirmed}
          />
        </div>
      </main>
    </div>
  );
}
