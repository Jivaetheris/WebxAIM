import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';

const WarehouseM = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) console.error('Fetch error:', error);
    else setWarehouses(data);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    if (editingId) {
      const { error } = await supabase
        .from('warehouses')
        .update(formData)
        .eq('id', editingId);

      if (error) console.error('Update error:', error);
      else setEditingId(null);
    } else {
      const { error } = await supabase.from('warehouses').insert([formData]);
      if (error) console.error('Insert error:', error);
    }

    setFormData({ name: '', location: '', capacity: '' });
    fetchWarehouses();
  }

  async function deleteWarehouse(id) {
    const { error } = await supabase.from('warehouses').delete().eq('id', id);
    if (error) console.error('Delete error:', error);
    else fetchWarehouses();
  }

  function editWarehouse(warehouse) {
    setEditingId(warehouse.id);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity
    });
  }

  return (
    <div >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Warehouse Management</h2>

      <div >
        <input
          name="name"
          placeholder="Warehouse Name"
          value={formData.name}
          onChange={handleChange}
          
        />
        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          
        />
        <input
          name="capacity"
          placeholder="Capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          
        />
        <button
          onClick={handleSubmit}
         
        >
          {editingId ? 'Update Warehouse' : 'Add Warehouse'}
        </button>
      </div>

      <table border={1}>
        <thead>
          <tr>
            <th >Name</th>
            <th>Location</th>
            <th >Capacity</th>
            <th >Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map(wh => (
            <tr key={wh.id}>
              <td >{wh.name}</td>
              <td >{wh.location}</td>
              <td >{wh.capacity}</td>
              <td >
                <button onClick={() => editWarehouse(wh)} style={{ marginRight: '0.5rem' }}>Update</button>
                <button onClick={() => deleteWarehouse(wh.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
          {warehouses.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '0.5rem', textAlign: 'center' }}>No warehouses found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseM;
