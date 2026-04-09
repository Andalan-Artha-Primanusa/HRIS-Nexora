import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { useProfiles } from "@/features/profile/hooks/useProfiles";
import type { Profile, ProfilePayload } from "@/features/profile/types/profile.types";
import "./ProfilesPage.css";

type ProfileFormState = ProfilePayload & { id: string };

const DEFAULT_FORM: ProfileFormState = {
  id: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
};

const getStringValue = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const mapProfileToForm = (profile: Profile): ProfileFormState => ({
  id: getStringValue(profile.id),
  phone: getStringValue(profile.phone),
  address: getStringValue(profile.address),
  city: getStringValue(profile.city),
  province: getStringValue(profile.province),
  postal_code: getStringValue(profile.postal_code),
});

const getDisplayColumns = (profiles: Profile[]) => {
  if (profiles.length === 0) {
    return ["id", "phone", "address", "city", "province", "postal_code"];
  }

  const preferred = ["id", "phone", "address", "city", "province", "postal_code"];
  const keys = Object.keys(profiles[0] as Record<string, unknown>);
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const ProfilesPage = () => {
  const {
    profiles,
    selectedProfile,
    responseText,
    statusMessage,
    errorMessage,
    loading,
    loadProfiles,
    createNewProfile,
    getProfileById,
    updateProfileById,
    deleteProfileById,
  } = useProfiles();

  const [formState, setFormState] = useState<ProfileFormState>(DEFAULT_FORM);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: keyof ProfileFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setValidationMessage(null);
  };

  const getPayload = (): ProfilePayload => ({
    phone: formState.phone,
    address: formState.address,
    city: formState.city,
    province: formState.province,
    postal_code: formState.postal_code,
  });

  const requireId = () => {
    const id = formState.id.trim();
    if (!id) {
      setValidationMessage("Profile ID wajib diisi untuk detail, update, atau delete.");
      return null;
    }
    return id;
  };

  const handleCreate = async () => {
    setValidationMessage(null);
    await createNewProfile(getPayload());
  };

  const handleGetDetail = async () => {
    const id = requireId();
    if (!id) return;

    const profile = await getProfileById(id);
    if (profile) {
      setFormState(mapProfileToForm(profile));
    }
  };

  const handleUpdate = async () => {
    const id = requireId();
    if (!id) return;

    const profile = await updateProfileById(id, getPayload());
    if (profile) {
      setFormState(mapProfileToForm(profile));
    }
  };

  const handleDelete = async () => {
    const id = requireId();
    if (!id) return;
    await deleteProfileById(id);
  };

  const columns = getDisplayColumns(profiles);

  return (
    <div className="profiles-page">
      <div className="profiles-page-header">
        <div>
          <h1>Profiles</h1>
          <p>Kelola user profile: list, create, detail, update, dan delete.</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadProfiles()} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      <Card className="profiles-status-card" glass>
        <div className="profiles-status-row">
          <Badge variant={errorMessage ? "danger" : "info"}>{statusMessage}</Badge>
          <span className="profiles-status-count">Total profiles: {profiles.length}</span>
        </div>
        {validationMessage && <p className="profiles-message profiles-message--error">{validationMessage}</p>}
        {errorMessage && <p className="profiles-message profiles-message--error">{errorMessage}</p>}
      </Card>

      <Card className="profiles-panel" glass>
        <h2>Profile Form</h2>
        <div className="profiles-form-grid">
          {(Object.keys(DEFAULT_FORM) as Array<keyof ProfileFormState>).map((field) => (
            <label key={field} className="profiles-form-group">
              <span>{field.replace(/_/g, " ").toUpperCase()}</span>
              <input
                value={formState[field]}
                onChange={(event) => handleChange(field, event.target.value)}
                placeholder={field}
                className="profiles-input"
              />
            </label>
          ))}
        </div>
        <div className="profiles-actions">
          <Button variant="primary" size="md" onClick={() => void handleCreate()} disabled={loading}>
            <Plus size={16} />
            Create
          </Button>
          <Button variant="outline" size="md" onClick={() => void handleGetDetail()} disabled={loading}>
            <Eye size={16} />
            Get Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void handleUpdate()} disabled={loading}>
            <Pencil size={16} />
            Update
          </Button>
          <Button variant="outline" size="md" onClick={() => void handleDelete()} disabled={loading}>
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </Card>

      <Card className="profiles-panel" glass>
        <h2>Selected Profile</h2>
        <pre className="profiles-response">
          {selectedProfile ? JSON.stringify(selectedProfile, null, 2) : "Belum ada detail profile dipilih."}
        </pre>
      </Card>

      <Card className="profiles-panel" glass>
        <h2>API Response</h2>
        <pre className="profiles-response">{responseText || "Response API akan muncul di sini."}</pre>
      </Card>

      <Card className="profiles-panel" glass>
        <h2>Profiles Table</h2>
        <div className="profiles-table-wrap">
          <table className="profiles-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.length > 0 ? (
                profiles.map((profile, index) => {
                  const rowId = getStringValue(profile.id) || `row-${index}`;
                  return (
                    <tr key={rowId}>
                      {columns.map((column) => {
                        const value = (profile as Record<string, unknown>)[column];
                        const printable =
                          value === null || value === undefined
                            ? "-"
                            : typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value);

                        return <td key={`${rowId}-${column}`}>{printable}</td>;
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length}>No profile data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProfilesPage;
