import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';

const WarehouseS = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) console.error('Fetch error:', error);
    else setWarehouses(data);
  }




  return (
    <div >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>The Goal Warehouses</h2>

      <table border={1}>
        <thead>
          <tr>
            <th >Name</th>
            <th>Location</th>
            <th >Capacity</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map(wh => (
            <tr key={wh.id}>
              <td >{wh.name}</td>
              <td >{wh.location}</td>
              <td >{wh.capacity}</td>
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

export default WarehouseS;
