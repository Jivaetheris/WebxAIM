import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';

const Role = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Get all roles
    const { data: roleData, error: roleErr } = await supabase
      .from('roles')
      .select('*');

    // Get users with role info
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select(`
        id,
        username,
        role_id,
        roles (name)
      `);

    if (roleErr || userErr) {
      console.error('Error loading roles/users:', roleErr || userErr);
    } else {
      setRoles(roleData);
      setUsers(userData);
    }

    setLoading(false);
  };

  const handleRoleChange = async (userId, newRoleId) => {
    const { error } = await supabase
      .from('users')
      .update({ role_id: newRoleId })
      .eq('id', userId);

    if (error) {
      console.error('Update error:', error);
      setUpdateMessage('Failed to update role.');
    } else {
      setUpdateMessage('Role updated successfully.');
      fetchData(); // Refresh list
    }

    // Hide message after 3 sec
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>User Roles Management</h2>
      {updateMessage && <p style={{ color: 'green' }}>{updateMessage}</p>}
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Username</th>
            <th>Current Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.roles?.name || 'Unknown'}</td>
              <td>
                <select
                  value={user.role_id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Role;
