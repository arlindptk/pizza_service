import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Cart from './components/layout/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import FindUs from './pages/FindUs';
import Login from './pages/Login';
import './styles/App.css';

function AppContent() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/find-us" element={<FindUs />} />
            <Route path="/login" element={<Login />} />
          </Routes>
      </main>
      <Footer />
      <Cart />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
