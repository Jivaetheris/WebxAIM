import { useEffect, useState } from "react";
import { supabase } from "../../createClient";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [tableFilter]);

  const fetchLogs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Failed to fetch activity logs:", error.message);
    } else {
      const filtered = tableFilter === "all"
        ? data
        : data.filter(log => log.table_name === tableFilter);
      setLogs(filtered);
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <div className="flex items-center gap-2">
          <select
            className="border rounded p-1 text-sm"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
          >
            <option value="all">All Tables</option>
            <option value="stock_entries">Stock Entries</option>
            <option value="stock_transfers">Stock Transfers</option>
            <option value="products">Products</option>
            <option value="warehouses">Warehouses</option>
            {/* Add more options based on your table_name values */}
          </select>
          <button
            onClick={fetchLogs}
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-600">No logs found.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Action</th>
                <th className="border p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2">{log.action}</td>
                  <td className="p-2">{log.table_name}</td>
                  <td className="p-2 text-xs text-gray-700">{log.record_id || "—"}</td>
                  <td className="p-2 max-w-xs whitespace-pre-wrap break-words">
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </td>
                  <td className="p-2 text-xs text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
