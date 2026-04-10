import { useEffect, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
  AlertCircle,
  User,
  MapPin,
  Heart,
  Briefcase,
  GraduationCap,
  CreditCard,
  Clock,
  FileText,
  Shield,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  birth_date: "",
  gender: "",
  marital_status: "",
  religion: "",
  nationality: "",
  id_number: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relation: "",
  current_address: "",
  permanent_address: "",
  bank_name: "",
  bank_account_number: "",
  bank_account_name: "",
  tax_number: "",
  last_education: "",
  institution_name: "",
  graduation_year: "",
  profile_photo_path: "",
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
  birth_date: getStringValue(profile.birth_date),
  gender: getStringValue(profile.gender),
  marital_status: getStringValue(profile.marital_status),
  religion: getStringValue(profile.religion),
  nationality: getStringValue(profile.nationality),
  id_number: getStringValue(profile.id_number),
  emergency_contact_name: getStringValue(profile.emergency_contact_name),
  emergency_contact_phone: getStringValue(profile.emergency_contact_phone),
  emergency_contact_relation: getStringValue(profile.emergency_contact_relation),
  current_address: getStringValue(profile.current_address),
  permanent_address: getStringValue(profile.permanent_address),
  bank_name: getStringValue(profile.bank_name),
  bank_account_number: getStringValue(profile.bank_account_number),
  bank_account_name: getStringValue(profile.bank_account_name),
  tax_number: getStringValue(profile.tax_number),
  last_education: getStringValue(profile.last_education),
  institution_name: getStringValue(profile.institution_name),
  graduation_year: getStringValue(profile.graduation_year),
  profile_photo_path: getStringValue(profile.profile_photo_path),
});

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.length > 0 ? `${value.length} items` : "-";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [record.name, record.title, record.phone, record.address, record.city, record.province, record.id];
    const firstPrimitive = candidates.find(
      (candidate) => candidate !== null && candidate !== undefined && typeof candidate !== "object"
    );
    return firstPrimitive ? String(firstPrimitive) : "-";
  }
  return String(value);
};

const formatDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value: unknown) => {
  if (typeof value === "number") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(parsed);
    }
    return value;
  }

  return "-";
};

const toTitle = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return "-";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ========== VALIDATION UTILITIES ==========
type ValidationError = {
  field: string;
  message: string;
};

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null;
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    return "Format nomor telepon tidak valid. Gunakan format +62 atau 0 diikuti 9-12 digit.";
  }
  return null;
};

const validateBirthDate = (birthDate: string): string | null => {
  if (!birthDate.trim()) return null;
  
  const date = new Date(birthDate);
  const today = new Date();
  
  if (Number.isNaN(date.getTime())) {
    return "Format tanggal lahir tidak valid.";
  }
  
  if (date > today) {
    return "Tanggal lahir tidak bisa melebihi hari ini.";
  }
  
  const age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();
  const day = today.getDate() - date.getDate();
  
  const actualAge = month < 0 || (month === 0 && day < 0) ? age - 1 : age;
  
  if (actualAge < 16) {
    return "Usia minimal harus 16 tahun.";
  }
  
  if (actualAge > 100) {
    return "Tanggal lahir tidak valid (usia terlalu tua).";
  }
  
  return null;
};

const validateIdNumber = (idNumber: string): string | null => {
  if (!idNumber.trim()) return null;
  if (!/^\d{16}$/.test(idNumber)) {
    return "Nomor ID harus 16 digit angka.";
  }
  return null;
};

const validateTaxNumber = (taxNumber: string): string | null => {
  if (!taxNumber.trim()) return null;
  if (!/^\d{15}$/.test(taxNumber)) {
    return "Nomor pajak harus 15 digit angka.";
  }
  return null;
};

const validateBankAccountNumber = (accountNumber: string): string | null => {
  if (!accountNumber.trim()) return null;
  if (!/^\d{10,20}$/.test(accountNumber)) {
    return "Nomor rekening bank harus 10-20 digit angka.";
  }
  return null;
};

const validateGraduationYear = (year: string): string | null => {
  if (!year.trim()) return null;
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  
  if (Number.isNaN(yearNum)) {
    return "Tahun kelulusan harus berupa angka.";
  }
  
  if (yearNum > currentYear) {
    return `Tahun kelulusan tidak bisa melebihi tahun ${currentYear}.`;
  }
  
  if (yearNum < 1950) {
    return "Tahun kelulusan tidak valid (terlalu lama).";
  }
  
  return null;
};

const validatePostalCode = (postalCode: string): string | null => {
  if (!postalCode.trim()) return null;
  if (!/^\d{5}$/.test(postalCode)) {
    return "Kode pos harus 5 digit angka.";
  }
  return null;
};

const validateForm = (formState: ProfileFormState): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Phone validation
  if (formState.phone) {
    const phoneError = validatePhone(formState.phone);
    if (phoneError) errors.push({ field: "phone", message: phoneError });
  }

  // Birth date validation
  if (formState.birth_date) {
    const birthDateError = validateBirthDate(formState.birth_date);
    if (birthDateError) errors.push({ field: "birth_date", message: birthDateError });
  }

  // ID Number validation
  if (formState.id_number) {
    const idError = validateIdNumber(formState.id_number);
    if (idError) errors.push({ field: "id_number", message: idError });
  }

  // Tax Number validation
  if (formState.tax_number) {
    const taxError = validateTaxNumber(formState.tax_number);
    if (taxError) errors.push({ field: "tax_number", message: taxError });
  }

  // Bank Account Number validation
  if (formState.bank_account_number) {
    const accountError = validateBankAccountNumber(formState.bank_account_number);
    if (accountError) errors.push({ field: "bank_account_number", message: accountError });
  }

  // Graduation Year validation
  if (formState.graduation_year) {
    const yearError = validateGraduationYear(formState.graduation_year);
    if (yearError) errors.push({ field: "graduation_year", message: yearError });
  }

  // Postal Code validation
  if (formState.postal_code) {
    const postalError = validatePostalCode(formState.postal_code);
    if (postalError) errors.push({ field: "postal_code", message: postalError });
  }

  // Emergency Contact Phone
  if (formState.emergency_contact_phone) {
    const emgPhoneError = validatePhone(formState.emergency_contact_phone);
    if (emgPhoneError) errors.push({ field: "emergency_contact_phone", message: emgPhoneError });
  }

  return errors;
};

// ========== ERROR MODAL COMPONENT ==========
type ErrorModalProps = {
  errors: ValidationError[];
  isOpen: boolean;
  onClose: () => void;
};

const ErrorModal = ({ errors, isOpen, onClose }: ErrorModalProps) => {
  if (!isOpen || errors.length === 0) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <div className="error-modal-header">
          <div className="error-modal-title">
            <AlertCircle size={24} className="error-icon" />
            <h2>Validasi Data Gagal</h2>
          </div>
          <button className="error-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="error-modal-body">
          <p className="error-modal-subtitle">Terdapat {errors.length} kesalahan yang perlu diperbaiki:</p>
          <div className="error-list">
            {errors.map((error, index) => (
              <div key={index} className="error-item">
                <span className="error-field">{error.field.replace(/_/g, " ").toUpperCase()}</span>
                <span className="error-message">{error.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="error-modal-footer">
          <Button variant="primary" size="md" onClick={onClose}>
            Perbaiki Data
          </Button>
        </div>
      </div>
    </div>
  );
};

// ========== TYPES & UTILS ==========
type InfoItem = {
  label: string;
  value: string;
};

// ========== SECTION CARD COMPONENT ==========
type SectionCardProps = {
  icon: React.ReactNode;
  title: string;
  items: InfoItem[] | null;
  children?: React.ReactNode;
};

const SectionCard = ({ icon, title, items, children }: SectionCardProps) => {
  return (
    <div className="profile-card-section">
      <div className="profile-card-section-header">
        <div className="profile-card-section-icon">{icon}</div>
        <h4>{title}</h4>
      </div>
      {items && items.length > 0 ? (
        <div className="profile-card-grid">
          {items.map((item) => (
            <div key={item.label} className="profile-card-item">
              <span className="profile-card-label">{item.label}</span>
              <span className="profile-card-value">{item.value}</span>
            </div>
          ))}
        </div>
      ) : children ? (
        <div className="profile-card-content">{children}</div>
      ) : (
        <p className="activity-placeholder">No data available.</p>
      )}
    </div>
  );
};

const buildDetailSections = (profile: Profile) => {
  const roles = Array.isArray(profile.roles) ? profile.roles : [];
  const primaryRole = roles[0];
  const permissions = Array.isArray(primaryRole?.permissions) ? primaryRole.permissions : [];
  const userRoles = Array.isArray(profile.user?.roles) ? profile.user.roles : [];

  const personalInfo: InfoItem[] = [
    { label: "Full Name", value: asDisplay(profile.user?.name) },
    { label: "Email", value: asDisplay(profile.user?.email) },
    { label: "Phone", value: asDisplay(profile.phone) },
    { label: "Birth Date", value: formatDate(profile.birth_date) },
    { label: "Gender", value: toTitle(profile.gender) },
    { label: "Marital Status", value: toTitle(profile.marital_status) },
    { label: "Religion", value: asDisplay(profile.religion) },
    { label: "Nationality", value: asDisplay(profile.nationality) },
    { label: "NIK / ID Number", value: asDisplay(profile.id_number) },
    { label: "Tax Number", value: asDisplay(profile.tax_number) },
  ];

  const addressInfo: InfoItem[] = [
    { label: "Address", value: asDisplay(profile.address) },
    { label: "Current Address", value: asDisplay(profile.current_address) },
    { label: "Permanent Address", value: asDisplay(profile.permanent_address) },
    { label: "City", value: asDisplay(profile.city) },
    { label: "Province", value: asDisplay(profile.province) },
    { label: "Postal Code", value: asDisplay(profile.postal_code) },
  ];

  const emergencyInfo: InfoItem[] = [
    { label: "Contact Name", value: asDisplay(profile.emergency_contact_name) },
    { label: "Contact Phone", value: asDisplay(profile.emergency_contact_phone) },
    { label: "Relation", value: toTitle(profile.emergency_contact_relation) },
  ];

  const bankInfo: InfoItem[] = [
    { label: "Bank Name", value: asDisplay(profile.bank_name) },
    { label: "Account Number", value: asDisplay(profile.bank_account_number) },
    { label: "Account Name", value: asDisplay(profile.bank_account_name) },
  ];

  const educationInfo: InfoItem[] = [
    { label: "Last Education", value: asDisplay(profile.last_education) },
    { label: "Institution", value: asDisplay(profile.institution_name) },
    { label: "Graduation Year", value: asDisplay(profile.graduation_year) },
  ];

  const employeeInfo: InfoItem[] = [
    { label: "Employee Code", value: asDisplay(profile.employee?.employee_code) },
    { label: "Position", value: asDisplay(profile.employee?.position) },
    { label: "Department", value: asDisplay(profile.employee?.department) },
    { label: "Hire Date", value: formatDate(profile.employee?.hire_date) },
    { label: "Salary", value: formatCurrency(profile.employee?.salary) },
    { label: "Manager", value: asDisplay(profile.employee?.manager?.name) },
  ];

  const systemInfo: InfoItem[] = [
    { label: "Profile ID", value: asDisplay(profile.id) },
    { label: "User ID", value: asDisplay(profile.user_id) },
    { label: "Location ID", value: asDisplay(profile.user?.location_id) },
    { label: "Created At", value: formatDate(profile.created_at) },
    { label: "Updated At", value: formatDate(profile.updated_at) },
    { label: "Photo Path", value: asDisplay(profile.profile_photo_path) },
  ];

  const roleNames = roles.map((role) => role.name).filter(Boolean).join(", ") || "-";
  const userRoleNames = userRoles.map((role) => role.name).filter(Boolean).join(", ") || "-";
  const permissionNames = permissions.map((permission) => permission.name).filter(Boolean).join(", ") || "-";

  return {
    personalInfo,
    addressInfo,
    emergencyInfo,
    bankInfo,
    educationInfo,
    employeeInfo,
    systemInfo,
    roleNames,
    userRoleNames,
    permissionNames,
  };
};

const ProfilesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeProfileId } = useParams<{ id: string }>();
  const isAddPage = location.pathname === "/profiles/add";
  const isViewPage = location.pathname.startsWith("/profiles/view/");
  const isUpdatePage = location.pathname.startsWith("/profiles/update/");

  const {
    profiles,
    selectedProfile,
    statusMessage,
    errorMessage,
    loading,
    loadProfiles,
    createNewProfile,
    getProfileById,
    updateProfileById,
    deleteProfileById,
  } = useProfiles();

  const [createForm, setCreateForm] = useState<ProfileFormState>(DEFAULT_FORM);
  const [updateForm, setUpdateForm] = useState<ProfileFormState>(DEFAULT_FORM);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  useEffect(() => {
    if (isAddPage || isViewPage || isUpdatePage) {
      return;
    }

    void loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddPage, isViewPage, isUpdatePage]);

  useEffect(() => {
    // Reset current profile index when profiles load
    setCurrentProfileIndex(0);
  }, [profiles.length]);

  useEffect(() => {
    if (!isViewPage && !isUpdatePage) {
      return;
    }

    if (!routeProfileId) {
      setValidationMessage("Profile ID tidak ditemukan di URL.");
      return;
    }

    const loadDetail = async () => {
      setValidationMessage(null);
      const profile = await getProfileById(routeProfileId);

      if (!profile) {
        setValidationMessage("Detail profile tidak ditemukan.");
        return;
      }

      if (isUpdatePage) {
        setUpdateForm(mapProfileToForm(profile));
      }
    };

    void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewPage, isUpdatePage, routeProfileId]);

  const handleCreateChange = (key: keyof ProfileFormState, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
    setValidationMessage(null);
  };

  const handleUpdateChange = (key: keyof ProfileFormState, value: string) => {
    setUpdateForm((prev) => ({ ...prev, [key]: value }));
    setValidationMessage(null);
  };

  const getPayload = (formState: ProfileFormState): ProfilePayload => {
    // Filter out empty strings and convert to proper types
    const payload: Record<string, unknown> = {};
    
    (Object.keys(DEFAULT_FORM) as Array<keyof ProfileFormState>).forEach((key) => {
      const value = formState[key];
      const trimmedValue = typeof value === "string" ? value.trim() : value;
      
      // Skip empty values
      if (trimmedValue === "" || trimmedValue === null || trimmedValue === undefined) {
        return;
      }

      // Handle type conversions
      if (key === "graduation_year") {
        const parsed = parseInt(trimmedValue as string, 10);
        if (!Number.isNaN(parsed)) {
          payload[key] = parsed;
        }
      } else {
        payload[key] = trimmedValue;
      }
    });

    console.log("📤 Payload being sent:", payload);
    return payload as unknown as ProfilePayload;
  };

  const requireId = (idValue: string) => {
    const id = idValue.trim();
    if (!id) {
      setValidationMessage("Profile ID wajib diisi.");
      return null;
    }
    return id;
  };

  const handleCreate = async () => {
    setValidationMessage(null);
    setValidationErrors([]);

    // Validate form
    const errors = validateForm(createForm);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsErrorModalOpen(true);
      return;
    }

    const profile = await createNewProfile(getPayload(createForm));
    if (profile) {
      setCreateForm(DEFAULT_FORM);
      navigate("/profiles");
    }
  };

  const handleUpdate = async () => {
    const id = requireId(updateForm.id);
    if (!id) return;

    setValidationMessage(null);
    setValidationErrors([]);

    // Validate form
    const errors = validateForm(updateForm);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsErrorModalOpen(true);
      return;
    }

    const payload = getPayload(updateForm);
    
    // Check if there's at least one field to update
    if (Object.keys(payload).length === 0) {
      setValidationMessage("Tidak ada data yang berubah untuk diupdate.");
      return;
    }

    const profile = await updateProfileById(id, payload);
    if (profile) {
      setUpdateForm(DEFAULT_FORM);
      navigate("/profiles");
    }
  };

  const handleDelete = async (idValue: string) => {
    const id = requireId(idValue);
    if (!id) return;

    await deleteProfileById(id);
  };

  const detailSections = selectedProfile ? buildDetailSections(selectedProfile) : null;

  if (isAddPage) {
    return (
      <div className="profiles-page">
        <div className="profiles-page-header">
          <div>
            <h1>Create Profile</h1>
            <p>Halaman khusus create profile agar alur lebih rapi.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate("/profiles")} disabled={loading}>
            Back to Profiles
          </Button>
        </div>

        <Card className="profiles-status-card" glass>
          <div className="profiles-status-row">
            <Badge variant={errorMessage ? "danger" : "info"}>{statusMessage}</Badge>
          </div>
          {validationMessage && <p className="profiles-message profiles-message--error">{validationMessage}</p>}
          {errorMessage && <p className="profiles-message profiles-message--error">{errorMessage}</p>}
        </Card>

        <Card className="profiles-panel" glass>
          <h2>Profile Form</h2>
          <div className="profiles-form-grid">
            {(Object.keys(DEFAULT_FORM).filter(f => f !== "id") as Array<keyof ProfileFormState>).map((field) => (
              <label key={field} className="profiles-form-group">
                <span>{field.replace(/_/g, " ").toUpperCase()}</span>
                <input
                  value={createForm[field]}
                  onChange={(event) => handleCreateChange(field, event.target.value)}
                  placeholder={field}
                  className="profiles-input"
                  type={field === "birth_date" ? "date" : field.includes("phone") ? "tel" : "text"}
                />
              </label>
            ))}
          </div>
          <div className="profiles-actions">
            <Button variant="primary" size="md" onClick={() => void handleCreate()} disabled={loading}>
              <Plus size={16} />
              Create
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate("/profiles")} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Card>
        <ErrorModal errors={validationErrors} isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} />
      </div>
    );
  }

  if (isViewPage) {
    return (
      <div className="profiles-page">
        <div className="profile-view-container">
          {/* Profile Header */}
          <div className="profile-header-section">
            <div className="profile-header-bg"></div>

            <div className="profile-top-content">
              <div className="profile-avatar">
                <div className="profile-avatar-placeholder">
                  {selectedProfile?.phone ? selectedProfile.phone.toString().charAt(0).toUpperCase() : "P"}
                </div>
              </div>

              <div className="profile-header-info">
                <div className="profile-name-row">
                  <div>
                    <h1>{selectedProfile?.user?.name ? selectedProfile.user.name : "User Profile"}</h1>
                    <p className="profile-bio">{selectedProfile?.employee?.position ? selectedProfile.employee.position : "No position data"}</p>
                  </div>
                  <div className="profile-actions-row">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/profiles/update/${routeProfileId ?? ""}`)}
                      disabled={loading || !routeProfileId}
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/profiles")}
                      disabled={loading}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="profile-stats-section">
            <div className="profile-stat">
              <span className="stat-value">{selectedProfile?.roles?.length ?? 0}</span>
              <span className="stat-label">Roles</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{selectedProfile?.leaves?.length ?? 0}</span>
              <span className="stat-label">Leaves</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{selectedProfile?.reimbursements?.length ?? 0}</span>
              <span className="stat-label">Reimbursements</span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content-section">
            <div className="profile-main-content">
              <Card className="profile-info-card" glass>
                <h3>Personal Information</h3>
                <div className="profile-info-list">
                  {detailSections?.personalInfo.map((item) => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Address Information</h3>
                <div className="profile-info-list">
                  {detailSections?.addressInfo.map((item) => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Emergency Contact</h3>
                <div className="profile-info-list">
                  {detailSections?.emergencyInfo.map((item) => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Bank Information</h3>
                <div className="profile-info-list">
                  {detailSections?.bankInfo.map((item) => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Education Information</h3>
                <div className="profile-info-list">
                  {detailSections?.educationInfo.map((item) => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Employee Information</h3>
                <div className="profile-info-list">
                  {detailSections?.employeeInfo.map((item) => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Role and Permission</h3>
                <div className="profile-info-list">
                  <div className="info-item info-item--full">
                    <span className="info-label">Roles</span>
                    <span className="info-value">{detailSections?.roleNames ?? "-"}</span>
                  </div>
                  <div className="info-item info-item--full">
                    <span className="info-label">User Roles</span>
                    <span className="info-value">{detailSections?.userRoleNames ?? "-"}</span>
                  </div>
                  <div className="info-item info-item--full">
                    <span className="info-label">Permissions</span>
                    <span className="info-value">{detailSections?.permissionNames ?? "-"}</span>
                  </div>
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>System Information</h3>
                <div className="profile-info-list">
                  {detailSections?.systemInfo.map((item) => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Leaves</h3>
                {selectedProfile?.leaves && selectedProfile.leaves.length > 0 ? (
                  <div className="profile-collection-list">
                    {selectedProfile.leaves.slice(0, 5).map((leave, index) => (
                      <div key={`${leave.id ?? index}-leave`} className="profile-collection-item">
                        <span className="info-label">{toTitle(leave.type)}</span>
                        <span className="info-value">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)} ({asDisplay(leave.total_days)} hari)
                        </span>
                        <span className="info-meta">Status: {toTitle(leave.status)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="activity-placeholder">Belum ada data leave.</p>
                )}
              </Card>

              <Card className="profile-info-card" glass>
                <h3>Reimbursements</h3>
                {selectedProfile?.reimbursements && selectedProfile.reimbursements.length > 0 ? (
                  <div className="profile-collection-list">
                    {selectedProfile.reimbursements.slice(0, 5).map((reimbursement, index) => (
                      <div key={`${reimbursement.id ?? index}-reimbursement`} className="profile-collection-item">
                        <span className="info-label">{asDisplay(reimbursement.title)}</span>
                        <span className="info-value">
                          {formatCurrency(reimbursement.amount)} - {toTitle(reimbursement.category)}
                        </span>
                        <span className="info-meta">
                          {formatDate(reimbursement.expense_date)} | Status: {toTitle(reimbursement.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="activity-placeholder">Belum ada data reimbursement.</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isUpdatePage) {
    return (
      <div className="profiles-page">
        <div className="profiles-page-header">
          <div>
            <h1>Update Profile</h1>
            <p>Halaman khusus update profile agar flow lebih rapi.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate("/profiles")} disabled={loading}>
            Back to Profiles
          </Button>
        </div>

        <Card className="profiles-status-card" glass>
          <div className="profiles-status-row">
            <Badge variant={errorMessage ? "danger" : "info"}>{statusMessage}</Badge>
          </div>
          {validationMessage && <p className="profiles-message profiles-message--error">{validationMessage}</p>}
          {errorMessage && <p className="profiles-message profiles-message--error">{errorMessage}</p>}
        </Card>

        <Card className="profiles-panel" glass>
          <h2>Update Form</h2>
          <div className="profiles-form-grid">
            {(Object.keys(DEFAULT_FORM) as Array<keyof ProfileFormState>).map((field) => (
              <label key={field} className="profiles-form-group">
                <span>{field.replace(/_/g, " ").toUpperCase()}</span>
                <input
                  value={updateForm[field]}
                  onChange={(event) => handleUpdateChange(field, event.target.value)}
                  placeholder={field}
                  className="profiles-input"
                  readOnly={field === "id"}
                  type={field === "birth_date" ? "date" : field.includes("phone") ? "tel" : field === "graduation_year" ? "number" : "text"}
                />
              </label>
            ))}
          </div>
          <div className="profiles-actions">
            <Button variant="secondary" size="md" onClick={() => void handleUpdate()} disabled={loading}>
              <Pencil size={16} />
              Update
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate("/profiles")} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Card>
        <ErrorModal errors={validationErrors} isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="profiles-page">
      <div className="profiles-page-header">
        <div>
          <h1>Profiles</h1>
          <p>List profile khusus tabel dengan action detail, update, dan delete per baris.</p>
        </div>
        <div className="profiles-actions" style={{ marginTop: 0 }}>
          <Button variant="primary" size="md" onClick={() => navigate("/profiles/add")} disabled={loading}>
            <Plus size={16} />
            Create Profile
          </Button>
          <Button variant="outline" size="md" onClick={() => void loadProfiles()} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
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
        <div className="profiles-panel-header">
          <h2>Profiles List</h2>
          {profiles.length > 0 && (
            <div className="profiles-pagination-info">
              Profile {currentProfileIndex + 1} of {profiles.length}
            </div>
          )}
        </div>

        {profiles.length > 0 ? (
          <div className="profiles-grid">
            {(() => {
              const profile = profiles[currentProfileIndex];
              const profileId = getStringValue(profile.id) || `row-${currentProfileIndex}`;
              const sections = buildDetailSections(profile);

              return (
                <div key={profileId} className="profile-card">
                  <div className="profile-card-header">
                    <div className="profile-card-title">
                      <div className="profile-card-avatar">
                        {profile.user?.name ? profile.user.name.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div>
                        <h3>{profile.user?.name || "Unknown"}</h3>
                        <p>{profile.employee?.position || "No position"}</p>
                      </div>
                    </div>
                    <div className="profile-card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/profiles/view/${profileId}`)}
                        disabled={loading}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/profiles/update/${profileId}`)}
                        disabled={loading}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDelete(profileId)}
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="profile-card-sections">
                    <SectionCard icon={<User size={18} />} title="Personal Information" items={sections.personalInfo} />
                    <SectionCard icon={<MapPin size={18} />} title="Address Information" items={sections.addressInfo} />
                    <SectionCard icon={<Heart size={18} />} title="Emergency Contact" items={sections.emergencyInfo} />
                    <SectionCard icon={<CreditCard size={18} />} title="Bank Information" items={sections.bankInfo} />
                    <SectionCard icon={<GraduationCap size={18} />} title="Education Information" items={sections.educationInfo} />
                    <SectionCard icon={<Briefcase size={18} />} title="Employee Information" items={sections.employeeInfo} />

                    {/* Role and Permission */}
                    <SectionCard icon={<Shield size={18} />} title="Role and Permission" items={null}>
                      <div className="profile-card-grid">
                        <div className="profile-card-item">
                          <span className="profile-card-label">Roles</span>
                          <span className="profile-card-value">{sections.roleNames}</span>
                        </div>
                        <div className="profile-card-item">
                          <span className="profile-card-label">User Roles</span>
                          <span className="profile-card-value">{sections.userRoleNames}</span>
                        </div>
                        <div className="profile-card-item">
                          <span className="profile-card-label">Permissions</span>
                          <span className="profile-card-value">{sections.permissionNames}</span>
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard icon={<FileText size={18} />} title="System Information" items={sections.systemInfo} />

                    {/* Attendances */}
                    <SectionCard icon={<Clock size={18} />} title="Attendances" items={null}>
                      {Array.isArray(profile.attendances) && profile.attendances.length > 0 ? (
                        <div className="profile-collection-list">
                          {profile.attendances.slice(0, 5).map((attendance: any, index: number) => (
                            <div key={`${attendance.id ?? index}-attendance`} className="profile-collection-item">
                              <span className="info-label">{formatDate(attendance.check_in)}</span>
                              <span className="info-value">
                                Check In: {attendance.check_in ? new Date(attendance.check_in).toLocaleTimeString("id-ID") : "-"}
                              </span>
                              {attendance.check_out && (
                                <span className="info-value">
                                  Check Out: {new Date(attendance.check_out).toLocaleTimeString("id-ID")}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="activity-placeholder">Belum ada data attendance.</p>
                      )}
                    </SectionCard>

                    {/* Leaves */}
                    <SectionCard icon={<Heart size={18} />} title="Leaves" items={null}>
                      {profile.leaves && profile.leaves.length > 0 ? (
                        <div className="profile-collection-list">
                          {profile.leaves.slice(0, 5).map((leave, index) => (
                            <div key={`${leave.id ?? index}-leave`} className="profile-collection-item">
                              <span className="info-label">{toTitle(leave.type)}</span>
                              <span className="info-value">
                                {formatDate(leave.start_date)} - {formatDate(leave.end_date)} ({asDisplay(leave.total_days)} hari)
                              </span>
                              <span className="info-meta">Status: {toTitle(leave.status)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="activity-placeholder">Belum ada data leave.</p>
                      )}
                    </SectionCard>

                    {/* KPIs */}
                    <SectionCard icon={<FileText size={18} />} title="KPIs" items={null}>
                      {Array.isArray(profile.kpis) && profile.kpis.length > 0 ? (
                        <div className="profile-collection-list">
                          {profile.kpis.slice(0, 5).map((kpi: any, index: number) => (
                            <div key={`${kpi.id ?? index}-kpi`} className="profile-collection-item">
                              <span className="info-label">{asDisplay(kpi.name)}</span>
                              <span className="info-value">{asDisplay(kpi.target)} - {asDisplay(kpi.achievement)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="activity-placeholder">Belum ada data KPI.</p>
                      )}
                    </SectionCard>

                    {/* Reimbursements */}
                    <SectionCard icon={<CreditCard size={18} />} title="Reimbursements" items={null}>
                      {profile.reimbursements && profile.reimbursements.length > 0 ? (
                        <div className="profile-collection-list">
                          {profile.reimbursements.slice(0, 5).map((reimbursement, index) => (
                            <div key={`${reimbursement.id ?? index}-reimbursement`} className="profile-collection-item">
                              <span className="info-label">{asDisplay(reimbursement.title)}</span>
                              <span className="info-value">
                                {formatCurrency(reimbursement.amount)} - {toTitle(reimbursement.category)}
                              </span>
                              <span className="info-meta">
                                {formatDate(reimbursement.expense_date)} | Status: {toTitle(reimbursement.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="activity-placeholder">Belum ada data reimbursement.</p>
                      )}
                    </SectionCard>

                    {/* Payrolls */}
                    <SectionCard icon={<CreditCard size={18} />} title="Payrolls" items={null}>
                      {Array.isArray(profile.payrolls) && profile.payrolls.length > 0 ? (
                        <div className="profile-collection-list">
                          {profile.payrolls.slice(0, 5).map((payroll: any, index: number) => (
                            <div key={`${payroll.id ?? index}-payroll`} className="profile-collection-item">
                              <span className="info-label">{formatDate(payroll.period_start)}</span>
                              <span className="info-value">{formatCurrency(payroll.gross_salary)}</span>
                              <span className="info-meta">Status: {toTitle(payroll.status)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="activity-placeholder">Belum ada data payroll.</p>
                      )}
                    </SectionCard>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="activity-placeholder">No profile data available.</div>
        )}

        {profiles.length > 1 && (
          <div className="profiles-pagination">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentProfileIndex(Math.max(0, currentProfileIndex - 1))}
              disabled={currentProfileIndex === 0 || loading}
            >
              ← Previous
            </Button>
            <span className="profiles-page-indicator">
              {currentProfileIndex + 1} / {profiles.length}
            </span>
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentProfileIndex(Math.min(profiles.length - 1, currentProfileIndex + 1))}
              disabled={currentProfileIndex === profiles.length - 1 || loading}
            >
              Next →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfilesPage;
