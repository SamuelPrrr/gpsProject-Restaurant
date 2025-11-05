import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Cocina from './pages/Cocina'
import Meseros from './pages/Meseros'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/cocina' element={<Cocina />} />
        <Route path='/meseros' element={<Meseros />} />
        <Route 
          path='/admin' 
          element={
            <ProtectedRoute allowedRoles={['administrator']}>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
