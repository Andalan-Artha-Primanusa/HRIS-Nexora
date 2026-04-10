import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { assignRolesToUser, getAllUsers } from "@/features/admin/api/admin.service";
import type { AdminEntityItem } from "@/features/admin/types/admin.types";
import "./AdminCrudPages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: AdminEntityItem[]) => {
  if (items.length === 0) {
    return ["id", "name", "email", "roles"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "name", "email", "roles"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const parseNumberArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => !Number.isNaN(item));

const AdminUsersPage = () => {
  const [items, setItems] = useState<AdminEntityItem[]>([]);
  const [userId, setUserId] = useState("");
  const [roleIdsText, setRoleIdsText] = useState("2,3");
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call admin users API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadUsers = async () => {
    setLoading(true);
    setStatusMessage("Memuat users...");
    setResponseText("");

    try {
      const result = await getAllUsers();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data users berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat users.";
      formatResponse(message);
      setStatusMessage("Gagal memuat users.");
    } finally {
      setLoading(false);
    }
  };

  const assignRoles = async () => {
    const id = userId.trim();
    if (!id) {
      setStatusMessage("User ID wajib diisi.");
      return;
    }

    const roleIds = parseNumberArray(roleIdsText);
    if (roleIds.length === 0) {
      setStatusMessage("role_ids wajib diisi, contoh: 2,3");
      return;
    }

    setLoading(true);
    setStatusMessage("Assign role ke user...");
    setResponseText("");

    try {
      const result = await assignRolesToUser(id, { role_ids: roleIds });
      formatResponse(result.raw);
      setStatusMessage("Role berhasil di-assign ke user.");
      await loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal assign role ke user.";
      formatResponse(message);
      setStatusMessage("Gagal assign role ke user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>User Management (Admin)</h1>
          <p>Endpoint: GET /admin/users, POST /admin/users/{"{id}"}/assign-role</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadUsers()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Assign Role to User</h2>
        <div className="crud-form-grid">
          <label>
            User ID
            <input className="crud-input" value={userId} onChange={(event) => setUserId(event.target.value)} />
          </label>
          <label>
            Role IDs (comma separated)
            <input className="crud-input" value={roleIdsText} onChange={(event) => setRoleIdsText(event.target.value)} />
          </label>
        </div>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void assignRoles()} disabled={loading}>
            Assign Roles
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Users Table</h2>
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>No user data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Raw Response</h2>
        <pre className="crud-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="crud-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
