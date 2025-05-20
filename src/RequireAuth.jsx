import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('userRole');

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
