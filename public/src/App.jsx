import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Cart from './components/layout/Cart';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Menu from './pages/Menu';
import FindUs from './pages/FindUs';
import Login from './pages/Login';
import Admin from './pages/Admin/Admin';
import AdminLogin from './pages/Admin/AdminLogin';
import CommandeTelephone from './pages/Admin/CommandeTelephone';
import VentesDuJour from './pages/Admin/VentesDuJour';
import './styles/App.css';

function AdminLayout({ children }) {
  return (
    <div className="app">
      <main className="main-content admin-main-layout">{children}</main>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdminArea && <Header />}
      <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/find-us" element={<FindUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout><Admin /></AdminLayout></AdminRoute>} />
            <Route path="/admin/commande-telephone" element={<AdminRoute><AdminLayout><CommandeTelephone /></AdminLayout></AdminRoute>} />
            <Route path="/admin/ventes" element={<AdminRoute><AdminLayout><VentesDuJour /></AdminLayout></AdminRoute>} />
          </Routes>
      </main>
      {!isAdminArea && <Footer />}
      {!isAdminArea && <Cart />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
