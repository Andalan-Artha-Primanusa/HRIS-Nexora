import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getLocationDetail,
  updateLocation,
} from "@/features/location/api/location.service";
import type { LocationCreatePayload, LocationItem, LocationUpdatePayload } from "@/features/location/types/location.types";
import "../admin/AdminCrudPages.css";

type LocationFormState = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  radius: string;
};

const DEFAULT_FORM: LocationFormState = {
  id: "",
  name: "Jakarta Office",
  latitude: "-6.200000",
  longitude: "106.816666",
  radius: "100",
};

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: LocationItem[]) => {
  if (items.length === 0) {
    return ["id", "name", "latitude", "longitude", "radius"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "name", "latitude", "longitude", "radius"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const LocationsPage = () => {
  const [items, setItems] = useState<LocationItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<LocationFormState>(DEFAULT_FORM);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call locations API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const requireId = () => {
    const id = form.id.trim();
    if (!id) {
      setStatusMessage("Location ID wajib diisi.");
      return null;
    }
    return id;
  };

  const loadLocations = async () => {
    setLoading(true);
    setStatusMessage("Memuat locations...");
    setResponseText("");

    try {
      const result = await getAllLocations();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data locations berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat locations.";
      formatResponse(message);
      setStatusMessage("Gagal memuat locations.");
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    setLoading(true);
    setStatusMessage("Membuat location...");
    setResponseText("");

    try {
      const payload: LocationCreatePayload = {
        name: form.name,
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        radius: Number(form.radius) || 0,
      };

      const result = await createLocation(payload);
      formatResponse(result.raw);
      setStatusMessage("Location berhasil dibuat.");
      await loadLocations();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal membuat location.";
      formatResponse(message);
      setStatusMessage("Gagal membuat location.");
    } finally {
      setLoading(false);
    }
  };

  const getDetail = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Memuat detail location...");
    setResponseText("");

    try {
      const result = await getLocationDetail(id);
      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;
      setSelectedDetail(payload);
      formatResponse(result.raw);
      setStatusMessage("Detail location berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat detail location.";
      formatResponse(message);
      setStatusMessage("Gagal memuat detail location.");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengupdate location...");
    setResponseText("");

    try {
      const payload: LocationUpdatePayload = {
        name: form.name,
        radius: Number(form.radius) || 0,
      };

      const result = await updateLocation(id, payload);
      formatResponse(result.raw);
      setStatusMessage("Location berhasil diupdate.");
      await loadLocations();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update location.";
      formatResponse(message);
      setStatusMessage("Gagal update location.");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus location...");
    setResponseText("");

    try {
      const result = await deleteLocation(id);
      formatResponse(result.raw);
      setStatusMessage("Location berhasil dihapus.");
      await loadLocations();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus location.";
      formatResponse(message);
      setStatusMessage("Gagal menghapus location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>Location Management</h1>
          <p>Endpoint: GET/POST /locations, GET/PUT/DELETE /locations/{"{id}"}</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadLocations()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Location Form</h2>
        <div className="crud-form-grid">
          <label>
            Location ID
            <input
              className="crud-input"
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="location id"
            />
          </label>
          <label>
            Name
            <input
              className="crud-input"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <label>
            Latitude
            <input
              className="crud-input"
              value={form.latitude}
              onChange={(event) => setForm((prev) => ({ ...prev, latitude: event.target.value }))}
            />
          </label>
          <label>
            Longitude
            <input
              className="crud-input"
              value={form.longitude}
              onChange={(event) => setForm((prev) => ({ ...prev, longitude: event.target.value }))}
            />
          </label>
          <label>
            Radius
            <input
              className="crud-input"
              value={form.radius}
              onChange={(event) => setForm((prev) => ({ ...prev, radius: event.target.value }))}
            />
          </label>
        </div>

        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void createItem()} disabled={loading}>
            Create Location
          </Button>
          <Button variant="outline" size="md" onClick={() => void getDetail()} disabled={loading}>
            Get Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void updateItem()} disabled={loading}>
            Update Location
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteItem()} disabled={loading}>
            Delete Location
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Location Detail</h2>
        <pre className="crud-response">
          {selectedDetail ? JSON.stringify(selectedDetail, null, 2) : "Belum ada detail location dipilih."}
        </pre>
      </Card>

      <Card className="crud-card" glass>
        <h2>Locations Table</h2>
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
                  <td colSpan={columns.length}>No location data available.</td>
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

export default LocationsPage;
