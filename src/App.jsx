import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Cocina from './pages/Cocina'
import Meseros from './pages/Meseros'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/cocina' element={<Cocina />} />
        <Route path='/meseros' element={<Meseros />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
