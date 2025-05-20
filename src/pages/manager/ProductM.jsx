// Product.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';
import Barcode from 'react-barcode';

const ProductM = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier_id: '',
    cost_price: '',
    selling_price: '',
    barcode: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name');
    if (error) console.error('Suppliers fetch error:', error);
    else setSuppliers(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, suppliers(name)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } else {
      setProducts(data);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '', sku: '', category: '', supplier_id: '', cost_price: '', selling_price: '', barcode: ''
    });
    setEditingId(null);
    setError(null);
  };

  const saveProduct = async () => {
    setError(null);
    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      supplier_id: formData.supplier_id || undefined,
      cost_price: parseFloat(formData.cost_price),
      selling_price: parseFloat(formData.selling_price),
      barcode: formData.barcode || formData.sku
    };
    console.log('Saving payload:', payload);

    let response;
    if (editingId) {
      response = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId)
        .select();
    } else {
      response = await supabase
        .from('products')
        .insert([payload])
        .single();
    }

    if (response.error) {
      console.error('Save error:', response.error);
      setError(response.error.message);
      return;
    }

    resetForm();
    fetchProducts();
  };

  const editProduct = product => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      supplier_id: product.supplier_id || '',
      cost_price: product.cost_price || '',
      selling_price: product.selling_price || '',
      barcode: product.barcode || product.sku || ''
    });
  };

  const deleteProduct = async id => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      setError(error.message);
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      {error && <p className="text-red-600 mb-2">Error: {error}</p>}

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {editingId ? 'Update Product' : 'Add New Product'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['name', 'sku', 'category'].map(field => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={formData[field]}
              onChange={handleChange}
              className="border p-2"
            />
          ))}
          <select
            name="supplier_id"
            value={formData.supplier_id}
            onChange={handleChange}
            className="border p-2"
          >
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {['cost_price ₱', 'selling_price ₱'].map(field => (
            <input
              key={field}
              type="number"
              name={field}
              placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={formData[field]}
              onChange={handleChange}
              className="border p-2"
              step="0.01"
            />
          ))}
          <input
            type="text"
            name="barcode"
            placeholder="Barcode (defaults to SKU)"
            value={formData.barcode}
            onChange={handleChange}
            className="border p-2"
          />
        </div>
        <button onClick={saveProduct} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">
          {editingId ? 'Update' : 'Create'}
        </button>
        {editingId && (
          <button onClick={resetForm} className="ml-4 mt-4 px-6 py-2 bg-gray-400 text-white rounded">
            Cancel
          </button>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">All Products</h2>
        <table className="table-auto w-full border" border={1}>
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Category</th>
              <th className="p-2">Supplier</th>
              <th className="p-2">Cost</th>
              <th className="p-2">Price</th>
              <th className="p-2">Barcode</th>
              <th className="p-2">Scan</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t">
                <td className="p-2">{product.id}</td>
                <td className="p-2">{product.name}</td>
                <td className="p-2">{product.sku}</td>
                <td className="p-2">{product.category}</td>
                <td className="p-2">{product.suppliers?.name}</td>
                <td className="p-2">₱{product.cost_price}</td>
                <td className="p-2">₱{product.selling_price}</td>
                <td className="p-2">{product.barcode}</td>
                <td className="p-2">
                  <Barcode
                    value={product.barcode || product.sku}
                    format="CODE128"
                    width={1}
                    height={40}
                    displayValue={false}
                  />
                </td>
                <td className="p-2">
                  <button onClick={() => editProduct(product)} className="px-3 py-1 bg-yellow-500 text-white rounded mr-2">
                    Edit
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="px-3 py-1 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ProductM;