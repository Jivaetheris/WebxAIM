import React, { useEffect, useState } from "react";
import { supabase } from "../../createClient";

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [movementHistory, setMovementHistory] = useState([]);

  useEffect(() => {
    loadData();
    fetchStockMovement();
  }, []);

  async function loadData() {
    const { data: stockData } = await supabase.rpc("get_stocks_with_names");
    const { data: productData } = await supabase.from("products").select("*");
    const { data: warehouseData } = await supabase.from("warehouses").select("*");

    setStocks(stockData || []);
    setProducts(productData || []);
    setWarehouses(warehouseData || []);
  }

  async function fetchStockMovement() {
    const { data, error } = await supabase
      .from("stock_entries")
      .select(`
        id,
        product_id,
        warehouse_id,
        quantity,
        date_received,
        products ( name ),
        warehouses ( name )
      `)
      .order("date_received", { ascending: false });

    if (!error) {
      setMovementHistory(data);
    }
  }

  const filteredStocks = selectedWarehouse
    ? stocks.filter((s) => s.warehouse_id.toString() === selectedWarehouse)
    : stocks;

  const lowStock = filteredStocks.filter((s) => s.quantity <= 50);
  const normalStock = filteredStocks.filter((s) => s.quantity > 50);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Stock Management</h2>

      {/* Filter */}
      <label>
        Filter by Warehouse:
        <select
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          value={selectedWarehouse}
        >
          <option value="">All</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.name}
            </option>
          ))}
        </select>
      </label>

      {/* Low Stock Alert */}
      <h3 style={{ marginTop: "30px" }}>🚨 Low Stock Alerts</h3>
      {lowStock.length === 0 ? (
        <p>No low stock items.</p>
      ) : (
        <ul>
          {lowStock.map((stock) => (
            <li key={stock.id} style={{ color: "red", marginBottom: "8px" }}>
              {stock.product_name} - {stock.quantity} pcs in {stock.warehouse_name}
              <strong> (Low Stock)</strong>
            </li>
          ))}
        </ul>
      )}

      {/* Normal Stock */}
      <h3 style={{ marginTop: "30px" }}>📦 Current Stock</h3>
      {normalStock.length === 0 ? (
        <p>No stock available.</p>
      ) : (
        <ul>
          {normalStock.map((stock) => (
            <li key={stock.id} style={{ marginBottom: "8px" }}>
              {stock.product_name} - {stock.quantity} pcs in {stock.warehouse_name}
            </li>
          ))}
        </ul>
      )}

      {/* Stock Movement History */}
      <h3 style={{ marginTop: "40px" }}>📊 Stock Movement History</h3>
      {movementHistory.length === 0 ? (
        <p>No stock movement records found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Entry ID</th>
              <th style={thStyle}>Product Name</th>
              <th style={thStyle}>Warehouse Name</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Date Received</th>
            </tr>
          </thead>
          <tbody>
            {movementHistory.map((entry) => (
              <tr key={entry.id}>
                <td style={tdStyle}>{entry.id}</td>
                <td style={tdStyle}>{entry.products?.name || "N/A"}</td>
                <td style={tdStyle}>{entry.warehouses?.name || "N/A"}</td>
                <td style={tdStyle}>{entry.quantity}</td>
                <td style={tdStyle}>
                  {new Date(entry.date_received).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  backgroundColor: "#f0f0f0",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};
