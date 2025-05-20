import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const MainLayout = ({ username, role, onLogout }) => {
  const navigate = useNavigate();

  const logout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <header style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
        <nav> 
          <h2 style={{ marginBottom: '10px' }}>
            {role ? `Hello ${role.charAt(0).toUpperCase() + role.slice(1)}!` : 'Unauthorized'}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {role === 'admin' && (
              <>
                <li><Link to="/admin/warehouse">Warehouse</Link></li>
                <li><Link to="/admin/stock">Stocks</Link></li>
                <li><Link to="/admin/order">Orders</Link></li>
                <li><Link to="/admin/product">Products</Link></li>
                <li><Link to="/admin/report">Reports</Link></li>
                <li><Link to="/admin/role">Roles</Link></li>
                <li><Link to="/admin/log">Logs</Link></li>
              </>
            )}
            {role === 'manager' && (
              <>
                <li><Link to="/manager/warehouse">Warehouse</Link></li>
                <li><Link to="/manager/stock">Stocks</Link></li>
                <li><Link to="/manager/order">Orders</Link></li>
                <li><Link to="/manager/product">Products</Link></li>
                <li><Link to="/manager/report">Reports</Link></li>
              </>
            )}
            {role === 'staff' && (
              <>
                <li><Link to="/staff/warehouse">Warehouse</Link></li>
                <li><Link to="/staff/stock">Stocks</Link></li>
                <li><Link to="/staff/product">Products</Link></li>
              </>
            )}
            {role && (
              <li>
                <button onClick={logout} style={{ padding: '5px 10px' }}>Logout</button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
