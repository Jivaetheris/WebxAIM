// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../createClient';


const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Step 1: Get user info + role name
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        password_hash,
        roles(name)
      `)
      .eq('username', username)
      .single();

    if (userError || !user) {
      setError('Invalid username or password');
      return;
    }

    // Step 2: Validate password (demo only - assumes hash = plain)
    if (user.password_hash !== password) {
      setError('Invalid username or password');
      return;
    }

    const roleName = user.roles?.name;

    if (!roleName) {
      setError('User role not found');
      return;
    }

    // Step 3: Store in localStorage and redirect
    localStorage.setItem('userRole', roleName);
    localStorage.setItem('username', user.username);
    onLogin(roleName);

    if (roleName === 'admin') navigate('/admin/warehouse');
    else if (roleName === 'manager') navigate('/manager/warehouse');
    else if (roleName === 'staff') navigate('/staff/warehouse');
    else {
      setError('Unknown role');
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <br />
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <br />
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
