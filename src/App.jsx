import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';

import Logs from './pages/admin/Logs';
import Orders from './pages/admin/Orders';
import Product from './pages/admin/Product';
import Report from './pages/admin/Report';
import Stock from './pages/admin/Stock';
import Warehouse from './pages/admin/Warehouse';
import Role from './pages/admin/Role';

import OrdersM from './pages/manager/OrdersM';
import ProductM from './pages/manager/ProductM';
import ReportM from './pages/manager/ReportM';
import StockM from './pages/manager/StockM';
import WarehouseM from './pages/manager/WarehouseM';

import WarehouseS from './pages/staff/WarehouseS';
import StockS from './pages/staff/StockS';
import ProductS from './pages/staff/ProductS';

const App = () => {
  const [username, setUsername] = useState(() => localStorage.getItem('username'));

  const getRoleFromUsername = (username) => {
    if (username?.startsWith('admin')) return 'admin';
    if (username?.startsWith('manager')) return 'manager';
    if (username?.startsWith('staff')) return 'staff';
    return null;
  };

  const role = getRoleFromUsername(username);

  const handleLogin = (username) => {
    localStorage.setItem('username', username);
    setUsername(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
  };

  const getHomeRoute = (role) => {
    switch (role) {
      case 'admin': return '/admin/warehouse';
      case 'manager': return '/manager/warehouse';
      case 'staff': return '/staff/warehouse';
      default: return '/login';
    }
  };

  return (
    <Router>
      <Routes>
        {!username ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <Route path="/" element={<MainLayout username={username} role={role} onLogout={handleLogout} />}>
            {/* Admin Routes */}
            {role === 'admin' && (
              <>
                <Route path="/admin/warehouse" element={<Warehouse />} />
                <Route path="/admin/stock" element={<Stock />} />
                <Route path="/admin/order" element={<Orders />} />
                <Route path="/admin/product" element={<Product />} />
                <Route path="/admin/report" element={<Report />} />
                <Route path="/admin/role" element={<Role />} />
                <Route path="/admin/log" element={<Logs />} />
                <Route path="*" element={<Navigate to={getHomeRoute(role)} />} />
              </>
            )}

            {/* Manager Routes */}
            {role === 'manager' && (
              <>
                <Route path="/manager/warehouse" element={<WarehouseM />} />
                <Route path="/manager/stock" element={<StockM />} />
                <Route path="/manager/order" element={<OrdersM />} />
                <Route path="/manager/product" element={<ProductM />} />
                <Route path="/manager/report" element={<ReportM />} />
                <Route path="*" element={<Navigate to={getHomeRoute(role)} />} />
              </>
            )}

            {/* Staff Routes */}
            {role === 'staff' && (
              <>
                <Route path="/staff/warehouse" element={<WarehouseS />} />
                <Route path="/staff/stock" element={<StockS />} />
                <Route path="/staff/product" element={<ProductS />} />
                <Route path="*" element={<Navigate to={getHomeRoute(role)} />} />
              </>
            )}
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
