import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ShopProducts from './components/ShopProducts';
import MyProducts from './components/MyProducts';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import ExportRequests from './components/ExportRequests';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route path="/shop/:shopId" element={<ShopProducts />} />
              <Route 
                path="/my-products" 
                element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-product" 
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-product/:productId" 
                element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/export-requests" 
                element={
                  <ProtectedRoute>
                    <ExportRequests />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;