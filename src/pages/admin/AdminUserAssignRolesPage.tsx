import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { assignRolesToUser, getAllUsers, getAllRoles } from "@/features/admin/api/admin.service";
import type { Role } from "@/shared/types/rbac.types";
import { Search, Users, ShieldCheck, CheckSquare, Square } from "lucide-react";
import "./AdminCrudPages.css";

interface UserListItem {
  id: number;
  name: string;
  email: string;
  role_names: string[];
}

const AdminUserAssignRolesPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [loading, setLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      const formattedUsers = result.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role_names: Array.isArray(item.roles) ? item.roles.map((r: any) => r.display_name || r.name) : [],
      }));
      setUsers(formattedUsers);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat users.";
      setStatusMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const result = await getAllRoles();
      setRoles(result.items as Role[]);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(u => 
      u.id.toString().includes(lowerQuery) || 
      u.name.toLowerCase().includes(lowerQuery) || 
      u.email.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  const handleSelectUser = (user: UserListItem) => {
    setSelectedUser(user);
    const currentRoleIds = roles
      .filter(r => user.role_names.includes(r.display_name || r.name))
      .map(r => r.id);
    
    setSelectedRoleIds(currentRoleIds);
    window.scrollTo({ top: document.getElementById('assignment-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) return;

    if (selectedRoleIds.length === 0) {
      setStatusMessage("Pilih minimal satu role.");
      setAlertType('warning');
      return;
    }

    setIsAssigning(true);
    setStatusMessage("Sedang assign role...");
    setAlertType('info');

    try {
      await assignRolesToUser(selectedUser.id.toString(), { role_ids: selectedRoleIds });
      setStatusMessage(`Role untuk ${selectedUser.name} berhasil diperbarui!`);
      setAlertType('success');
      setSelectedUser(null);
      setSelectedRoleIds([]);
      await loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal assign role.";
      setStatusMessage(message);
      setAlertType('error');
    } finally {
      setIsAssigning(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    void loadRoles();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>👥 Manajemen Peran Pengguna</h1>
          <p>Pilih karyawan berdasarkan ID atau Nama untuk menyesuaikan hak akses mereka.</p>
        </div>
        <Button variant="outline" size="md" onClick={() => navigate("/admin/users")}>
          ← Kembali ke Users
        </Button>
      </div>

      {statusMessage && (
        <Alert 
          type={alertType} 
          message={statusMessage} 
          onClose={() => setStatusMessage('')}
          dismissible
        />
      )}

      <div className="crud-content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        <Card className="crud-card" glass style={{ height: 'fit-content' }}>
          <div className="crud-card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}><Users size={20} style={{ marginRight: '8px' }} /> 1. Pilih Karyawan</h2>
            <div className="search-box" style={{ maxWidth: '250px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={16} color="var(--primary)" />
              <input 
                type="text" 
                placeholder="Cari ID atau Nama..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>

          <div className="crud-table-wrap" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="crud-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Karyawan</th>
                  <th>Peran Saat Ini</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada karyawan ditemukan.</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr 
                    key={u.id} 
                    onClick={() => handleSelectUser(u)}
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: selectedUser?.id === u.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                      borderLeft: selectedUser?.id === u.id ? '4px solid var(--primary)' : 'none'
                    }}
                  >
                    <td><span className="cell-id">#{u.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{u.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {u.role_names.length > 0 ? u.role_names.map((rn, idx) => (
                          <span key={idx} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--primary-lighter)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600 }}>
                            {rn}
                          </span>
                        )) : <span style={{ color: '#999', fontSize: '0.75rem' }}>-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div id="assignment-section">
          <Card className="crud-card" glass style={{ opacity: selectedUser ? 1 : 0.6, pointerEvents: selectedUser ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
            <h2><ShieldCheck size={20} style={{ marginRight: '8px' }} /> 2. Sesuaikan Peran</h2>
            
            {selectedUser && (
              <div style={{ marginBottom: '1.2rem', padding: '0.8rem', borderRadius: '8px', backgroundColor: 'var(--primary-lighter)', border: '1px solid var(--primary-light)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>KARYAWAN TERPILIH</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedUser.name} <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>(#{selectedUser.id})</span></div>
              </div>
            )}

            <div className="crud-table-wrap">
              <table className="crud-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Pilih</th>
                    <th>Nama Peran</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr 
                      key={role.id} 
                      onClick={() => handleToggleRole(role.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        {selectedRoleIds.includes(role.id) ? (
                          <CheckSquare size={20} color="var(--primary)" />
                        ) : (
                          <Square size={20} color="#cbd5e1" />
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{role.display_name || role.name}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{role.name}</div>
                        {role.id === 1 && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>🔒 HANYA SUPER ADMIN</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="crud-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <Button 
                variant="outline" 
                size="md" 
                onClick={() => setSelectedUser(null)}
                disabled={isAssigning}
              >
                Batal
              </Button>
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => void handleAssignRoles()}
                disabled={isAssigning || !selectedUser || selectedRoleIds.length === 0}
              >
                {isAssigning ? "Menyimpan..." : "✓ Simpan Peran"}
              </Button>
            </div>
            
            {!selectedUser && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(1px)', zIndex: 10 }}>
                <div style={{ textAlign: 'center', padding: '1rem', borderRadius: '8px', backgroundColor: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Users size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 600, color: '#64748b' }}>Silakan pilih karyawan terlebih dahulu</div>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminUserAssignRolesPage;
