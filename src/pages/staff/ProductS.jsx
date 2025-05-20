// Product.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';
import Barcode from 'react-barcode';

const ProductS = () => {
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
  
  return (
    <div className="p-6">
      

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

              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ProductS;