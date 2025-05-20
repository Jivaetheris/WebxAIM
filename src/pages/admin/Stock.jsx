import React, { useEffect, useState } from "react";
import { supabase } from "../../createClient";
import { logActivity } from "../../assets/logActivity"; 

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const [newStock, setNewStock] = useState({
    product_id: "",
    warehouse_id: "",
    quantity: 0,
  });

  const [transfer, setTransfer] = useState({
    product_id: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    quantity: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: stockData } = await supabase.rpc("get_stocks_with_names");
    const { data: productData } = await supabase.from("products").select("*");
    const { data: warehouseData } = await supabase.from("warehouses").select("*");

    setStocks(stockData || []);
    setProducts(productData || []);
    setWarehouses(warehouseData || []);
  }

  async function handleAddStock(e) {
    e.preventDefault();
    const { product_id, warehouse_id, quantity } = newStock;
    const qty = Number(quantity);

    if (!product_id || !warehouse_id || qty <= 0) {
      alert("Please provide valid stock info.");
      return;
    }

    const { error: insertError } = await supabase.from("stock_entries").insert([
      { product_id, warehouse_id, quantity: qty }
    ]);
    if (insertError) {
      alert("Failed to add stock.");
      return;
    }

    const { data: product } = await supabase
      .from("products")
      .select("stock, name")
      .eq("id", product_id)
      .single();

    const newStockLevel = (product?.stock || 0) + qty;

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStockLevel })
      .eq("id", product_id);

    if (updateError) {
      alert("Stock added, but failed to update product stock.");
    }

    const warehouse = warehouses.find(w => w.id === warehouse_id);
    await logActivity(`Added ${qty} ${product?.name} to ${warehouse?.name}`);

    setNewStock({ product_id: "", warehouse_id: "", quantity: 0 });
    loadData();
  }

  async function handleTransferStock(e) {
    e.preventDefault();
    const qty = Number(transfer.quantity);
    const { data, error } = await supabase.rpc("transfer_stock", {
      in_product_id: transfer.product_id,
      from_warehouse_id: transfer.from_warehouse_id,
      to_warehouse_id: transfer.to_warehouse_id,
      transfer_quantity: qty,
    });

    if (error) {
      console.error("Transfer failed:", error);
      alert(`Transfer failed: ${error.message}`);
      return;
    }

    const product = products.find(p => p.id === transfer.product_id);
    const from = warehouses.find(w => w.id === transfer.from_warehouse_id);
    const to = warehouses.find(w => w.id === transfer.to_warehouse_id);
    await logActivity(`Transferred ${qty} ${product?.name} from ${from?.name} to ${to?.name}`);

    setTransfer({ product_id: "", from_warehouse_id: "", to_warehouse_id: "", quantity: 0 });
    loadData();
  }

  const filteredStocks = selectedWarehouse
    ? stocks.filter((s) => s.warehouse_id.toString() === selectedWarehouse)
    : stocks;

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
      <h3>Low Stock Alerts!</h3>
      <ul>
        {filteredStocks
          .filter((stock) => stock.quantity <= 50)
          .map((stock) => (
            <li key={stock.id} style={{ color: "red", fontWeight: "bold" }}>
              {stock.product_name} - {stock.quantity} pcs @ {stock.warehouse_name}
            </li>
          ))}
      </ul>

      {/* Current Stock */}
      <h3>Current Stock</h3>
      <ul>
        {filteredStocks
          .filter((stock) => stock.quantity > 50)
          .map((stock) => (
            <li key={stock.id}>
              {stock.product_name} - {stock.quantity} pcs in {stock.warehouse_name}
            </li>
          ))}
      </ul>

      {/* Add Stock */}
      <h3>Add Stock</h3>
      <form onSubmit={handleAddStock}>
        <select
          required
          onChange={(e) => setNewStock({ ...newStock, product_id: e.target.value })}
          value={newStock.product_id}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          required
          onChange={(e) => setNewStock({ ...newStock, warehouse_id: e.target.value })}
          value={newStock.warehouse_id}
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={newStock.quantity}
          onChange={(e) =>
            setNewStock({ ...newStock, quantity: Number(e.target.value) })
          }
          required
        />

        <button type="submit">Add</button>
      </form>

      {/* Transfer Stock */}
      <h3>Transfer Stock</h3>
      <form onSubmit={handleTransferStock}>
        <select
          required
          onChange={(e) => setTransfer({ ...transfer, product_id: e.target.value })}
          value={transfer.product_id}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          required
          onChange={(e) =>
            setTransfer({ ...transfer, from_warehouse_id: e.target.value })
          }
          value={transfer.from_warehouse_id}
        >
          <option value="">From Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          required
          onChange={(e) =>
            setTransfer({ ...transfer, to_warehouse_id: e.target.value })
          }
          value={transfer.to_warehouse_id}
        >
          <option value="">To Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={transfer.quantity}
          onChange={(e) =>
            setTransfer({ ...transfer, quantity: Number(e.target.value) })
          }
          required
        />

        <button type="submit">Transfer</button>
      </form>
    </div>
  );
}
