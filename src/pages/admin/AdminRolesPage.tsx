import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { assignPermissionsToRole, getAllRoles } from "@/features/admin/api/admin.service";
import type { AdminEntityItem } from "@/features/admin/types/admin.types";
import "./AdminCrudPages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: AdminEntityItem[]) => {
  if (items.length === 0) {
    return ["id", "name", "permissions_count"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "name", "permissions_count"];
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

const AdminRolesPage = () => {
  const [items, setItems] = useState<AdminEntityItem[]>([]);
  const [roleId, setRoleId] = useState("");
  const [permissionIdsText, setPermissionIdsText] = useState("1,2,3");
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call admin roles API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadRoles = async () => {
    setLoading(true);
    setStatusMessage("Memuat roles...");
    setResponseText("");

    try {
      const result = await getAllRoles();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data roles berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat roles.";
      formatResponse(message);
      setStatusMessage("Gagal memuat roles.");
    } finally {
      setLoading(false);
    }
  };

  const assignPermissions = async () => {
    const id = roleId.trim();
    if (!id) {
      setStatusMessage("Role ID wajib diisi.");
      return;
    }

    const permissionIds = parseNumberArray(permissionIdsText);
    if (permissionIds.length === 0) {
      setStatusMessage("permission_ids wajib diisi, contoh: 1,2,3");
      return;
    }

    setLoading(true);
    setStatusMessage("Assign permission ke role...");
    setResponseText("");

    try {
      const result = await assignPermissionsToRole(id, { permission_ids: permissionIds });
      formatResponse(result.raw);
      setStatusMessage("Permission berhasil di-assign ke role.");
      await loadRoles();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal assign permission ke role.";
      formatResponse(message);
      setStatusMessage("Gagal assign permission ke role.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>Role Management (Admin)</h1>
          <p>Endpoint: GET /admin/roles, POST /admin/roles/{"{id}"}/assign-permission</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadRoles()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Assign Permission to Role</h2>
        <div className="crud-form-grid">
          <label>
            Role ID
            <input className="crud-input" value={roleId} onChange={(event) => setRoleId(event.target.value)} />
          </label>
          <label>
            Permission IDs (comma separated)
            <input
              className="crud-input"
              value={permissionIdsText}
              onChange={(event) => setPermissionIdsText(event.target.value)}
            />
          </label>
        </div>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void assignPermissions()} disabled={loading}>
            Assign Permissions
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Roles Table</h2>
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
                  <td colSpan={columns.length}>No role data available.</td>
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

export default AdminRolesPage;
