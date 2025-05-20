// Orders.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../createClient';
const OrdersM = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({ customer_name: '', status: 'Pending' });
  const [orderItems, setOrderItems] = useState([]);
  const [newItem, setNewItem] = useState({ product_id: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock')
      .order('name', { ascending: true });

    if (error) console.error('Fetch products error:', error);
    else setProducts(data);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('sales_orders')
      .select(`
        id,
        customer_name,
        order_date,
        status,
        sales_order_items (
          id,
          product_id,
          quantity
        )
      `)
      .order('order_date', { ascending: false });

    if (error) setError(error.message);
    else setOrders(data);
  };

  const handleOrderChange = e => {
    const { name, value } = e.target;
    setNewOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = e => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (newItem.product_id && newItem.quantity) {
      setOrderItems(prev => [...prev, { ...newItem }]);
      setNewItem({ product_id: '', quantity: '' });
    }
  };

  const createOrder = async () => {
  setError(null);
  setLoading(true);

  try {
    await fetchProducts(); // ✅ Refresh product list before checking stock

    // Check stock
    for (const item of orderItems) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) throw new Error(`Product not found: ID ${item.product_id}`);
      if (parseInt(item.quantity) > parseInt(product.stock)) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }
    }

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from('sales_orders')
      .insert([newOrder])
      .select()
      .single();
    if (orderErr) throw orderErr;

    // Insert order items
    const itemsToInsert = orderItems.map(item => ({
      sales_order_id: order.id,
      product_id: item.product_id,
      quantity: parseInt(item.quantity),
    }));

    const { error: itemsErr } = await supabase
      .from('sales_order_items')
      .insert(itemsToInsert);
    if (itemsErr) throw itemsErr;

    // Deduct stock
    for (const item of orderItems) {
      const product = products.find(p => p.id === item.product_id);
      const newStock = parseInt(product.stock) - parseInt(item.quantity); // ✅ Safe subtraction

      const { error: stockErr } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product_id);

      if (stockErr) {
        console.error('Stock update error:', stockErr); // ✅ Debug log
        throw stockErr;
      }
    }

    resetForm();
    await fetchProducts(); // ✅ Refresh stock UI
    await fetchOrders();   // ✅ Refresh order list

  } catch (err) {
    setError(err.message || 'Failed to create order');
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setNewOrder({ customer_name: '', status: 'Pending' });
    setOrderItems([]);
    setNewItem({ product_id: '', quantity: '' });
  };

  const updateOrderStatus = async (id, status) => {
    setLoading(true);
    const { error } = await supabase
      .from('sales_orders')
      .update({ status })
      .eq('id', id);
    if (error) setError(error.message);
    else await fetchOrders();
    setLoading(false);
  };

  const deleteOrder = async id => {
    setLoading(true);
    await supabase.from('sales_order_items').delete().eq('sales_order_id', id);
    const { error } = await supabase.from('sales_orders').delete().eq('id', id);
    if (error) setError(error.message);
    else await fetchOrders();
    setLoading(false);
  };

  return (
    <div>
      <h1>Orders</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <h2>Create Order</h2>
      <input
        name="customer_name"
        placeholder="Customer name"
        value={newOrder.customer_name}
        onChange={handleOrderChange}
        disabled={loading}
      />
      <select
        name="status"
        value={newOrder.status}
        onChange={handleOrderChange}
        disabled={loading}
      >
        <option value="Pending">Pending</option>
        <option value="In Transit">In Transit</option>
        <option value="Received">Received</option>
      </select>
      
      <select
        name="product_id"
        value={newItem.product_id}
        onChange={handleItemChange}
        disabled={loading}
      >
        <option value="">Select product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} (Stock: {p.stock})
          </option>
        ))}
      </select>
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={newItem.quantity}
        onChange={handleItemChange}
        disabled={loading}
      />
      <button onClick={addItem} disabled={loading}>
        Add Item
      </button>

      <ul>
        {orderItems.map((item, idx) => {
          const product = products.find(p => p.id === item.product_id);
          return (
            <li key={idx}>
              {product?.name || item.product_id} x {item.quantity}
            </li>
          );
        })}
      </ul>

      <button onClick={createOrder} disabled={loading || !orderItems.length}>
        {loading ? 'Processing...' : 'Create Order'}
      </button>

      <h2>Orders</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Date</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer_name}</td>
              <td>
                <select
                  value={order.status}
                  onChange={e => updateOrderStatus(order.id, e.target.value)}
                  disabled={loading}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Received">Received</option>
                </select>
              </td>
              <td>{new Date(order.order_date).toLocaleDateString()}</td>
              <td>
                <ul>
                  {order.sales_order_items.map(item => {
                    const prod = products.find(p => p.id === item.product_id);
                    return (
                      <li key={item.id}>
                        {prod?.name || item.product_id} x {item.quantity}
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td>
                <button onClick={() => deleteOrder(order.id)} disabled={loading}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersM;
