    import { useEffect, useState } from "react";
    import { supabase } from "../../createClient";

    export default function Report() {
      const [reportType, setReportType] = useState("currentStock");
      const [reportData, setReportData] = useState([]);
      const [showOptions, setShowOptions] = useState(false);

      useEffect(() => {
        const fetchReport = async () => {
          let data = [];

          switch (reportType) {
            case "currentStock":
              ({ data } = await supabase.rpc("get_stocks_with_names"));
              break;

            case "lowStock":
              ({ data } = await supabase.rpc("get_stocks_with_names"));
              // Filter items below threshold or out of stock
              data = data.filter(item => item.quantity < item.threshold || item.quantity <= 10);
              break;

            case "stockMovement":
              const { data: movementData } = await supabase
                .from("stock_entries")
                .select(`
                  id,
                  product_id,
                  warehouse_id,
                  quantity,
                  date_received,
                  product:products(name),
                  warehouse:warehouses(name)
                `)
                .order("date_received", { ascending: false });
              data = movementData;
              break;

            case "inventoryValue":
              const { data: valueData } = await supabase
                .from("products")
                .select("name, cost_price, stock");
              data = valueData.map(item => ({
                product: item.name,
                cost_price: item.cost_price,
                stock: item.stock,
                total_value: item.cost_price * (item.stock ?? 0),
              }));
              break;

            default:
              break;
          }

          setReportData(data || []);
        };

        fetchReport();
      }, [reportType]);

      const exportToCSV = () => {
        let headers = [];
        let rows = [];

        switch (reportType) {
          case "currentStock":
          case "lowStock":
            headers = [
              "Product ID",
              "Product Name",
              "Warehouse ID",
              "Warehouse Name",
              "Quantity",
              "Threshold",
            ];
            rows = reportData.map(row => [
              row.product_id,
              row.product_name,
              row.warehouse_id,
              row.warehouse_name,
              row.quantity,
              row.threshold,
            ]);
            break;

          case "stockMovement":
            headers = [
              "Entry ID",
              "Product ID",
              "Product Name",
              "Warehouse ID",
              "Warehouse Name",
              "Quantity",
              "Date Received",
            ];
            rows = reportData.map(row => [
              row.id,
              row.product_id,
              row.product?.name,
              row.warehouse_id,
              row.warehouse?.name,
              row.quantity,
              row.date_received,
            ]);
            break;

          case "inventoryValue":
            headers = ["Product", "Cost Price", "Stock", "Total Value"];
            rows = reportData.map(row => [
              row.product,
              row.cost_price,
              row.stock,
              row.total_value,
            ]);
            break;

          default:
            break;
        }

        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType}_report.csv`;
        link.click();
        setShowOptions(false);
      };

      const exportToExcel = () => {
        let headers = [];
        let rows = [];

        switch (reportType) {
          case "currentStock":
          case "lowStock":
            headers = [
              "Product ID",
              "Product Name",
              "Warehouse ID",
              "Warehouse Name",
              "Quantity",
              "Threshold",
            ];
            rows = reportData.map(row => [
              row.product_id,
              row.product_name,
              row.warehouse_id,
              row.warehouse_name,
              row.quantity,
              row.threshold,
            ]);
            break;

          case "stockMovement":
            headers = [
              "Entry ID",
              "Product ID",
              "Product Name",
              "Warehouse ID",
              "Warehouse Name",
              "Quantity",
              "Date Received",
            ];
            rows = reportData.map(row => [
              row.id,
              row.product_id,
              row.product?.name,
              row.warehouse_id,
              row.warehouse?.name,
              row.quantity,
              row.date_received,
            ]);
            break;

          case "inventoryValue":
            headers = ["Product", "Cost Price", "Stock", "Total Value"];
            rows = reportData.map(row => [
              row.product,
              row.cost_price,
              row.stock,
              row.total_value,
            ]);
            break;

          default:
            break;
        }

        let table = `<table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
        rows.forEach(row => {
          table += `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`;
        });
        table += `</table>`;

        const blob = new Blob([table], { type: "application/vnd.ms-excel" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType}_report.xls`;
        link.click();
        setShowOptions(false);
      };

      const thStyle = {
        border: "1px solid #ddd",
        padding: "8px",
        backgroundColor: "#f2f2f2",
        textAlign: "left",
      };

      const tdStyle = {
        border: "1px solid #ddd",
        padding: "8px",
      };

      const dropdownStyle = {
        position: "absolute",
        backgroundColor: "#fff",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
        zIndex: 1,
      };

      const optionStyle = {
        padding: "8px 12px",
        cursor: "pointer",
      };

      return (
        <div style={{ padding: "20px", position: "relative" }}>
          <h2>Inventory Reports</h2>

          <div style={{ marginBottom: "10px" }}>
            <button onClick={() => setReportType("currentStock")}>Current Stock Levels</button>
            <button onClick={() => setReportType("lowStock")}>Low-Stock Products</button>
            <button onClick={() => setReportType("stockMovement")}>Stock Movement History</button>
            <button onClick={() => setReportType("inventoryValue")}>Inventory Value Analysis</button>
          </div>

          <div style={{ position: "relative", display: "inline-block", marginBottom: "10px" }}>
            <button onClick={() => setShowOptions(!showOptions)}>Export ▾</button>
            {showOptions && (
              <div style={dropdownStyle}>
                <div style={optionStyle} onClick={exportToCSV}>Export as CSV</div>
                <div style={optionStyle} onClick={exportToExcel}>Export as Excel</div>
              </div>
            )}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
                {(reportType === "currentStock" || reportType === "lowStock") && (
                  <>
                    <th style={thStyle}>Product ID</th>
                    <th style={thStyle}>Product Name</th>
                    <th style={thStyle}>Warehouse ID</th>
                    <th style={thStyle}>Warehouse Name</th>
                    <th style={thStyle}>Quantity</th>
                    <th style={thStyle}>Threshold</th>
                  </>
                )}
                {reportType === "stockMovement" && (
                  <>
                    <th style={thStyle}>Entry ID</th>
                    <th style={thStyle}>Product ID</th>
                    <th style={thStyle}>Product Name</th>
                    <th style={thStyle}>Warehouse ID</th>
                    <th style={thStyle}>Warehouse Name</th>
                    <th style={thStyle}>Quantity</th>
                    <th style={thStyle}>Date Received</th>
                  </>
                )}
                {reportType === "inventoryValue" && (
                  <>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Cost Price</th>
                    <th style={thStyle}>Stock</th>
                    <th style={thStyle}>Total Value</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx}>
                  {(reportType === "currentStock" || reportType === "lowStock") && (
                    <>
                      <td style={tdStyle}>{row.product_id}</td>
                      <td style={tdStyle}>{row.product_name}</td>
                      <td style={tdStyle}>{row.warehouse_id}</td>
                      <td style={tdStyle}>{row.warehouse_name}</td>
                      <td style={tdStyle}>{row.quantity}</td>
                      <td style={tdStyle}>{row.threshold}</td>
                    </>
                  )}
                  {reportType === "stockMovement" && (
                    <>
                      <td style={tdStyle}>{row.id}</td>
                      <td style={tdStyle}>{row.product_id}</td>
                      <td style={tdStyle}>{row.product?.name}</td>
                      <td style={tdStyle}>{row.warehouse_id}</td>
                      <td style={tdStyle}>{row.warehouse?.name}</td>
                      <td style={tdStyle}>{row.quantity}</td>
                      <td style={tdStyle}>
                        {new Date(row.date_received).toLocaleDateString()}
                      </td>
                    </>
                  )}
                  {reportType === "inventoryValue" && (
                    <>
                      <td style={tdStyle}>{row.product}</td>
                      <td style={tdStyle}>{row.cost_price}</td>
                      <td style={tdStyle}>{row.stock}</td>
                      <td style={tdStyle}>{row.total_value}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
