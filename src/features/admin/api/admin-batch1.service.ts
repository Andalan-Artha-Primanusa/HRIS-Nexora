import { api } from "@/shared/api/httpClient";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
	value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown): unknown => {
	const root = toRecord(raw);
	return root.data ?? raw;
};

const extractArrayPayload = <T>(raw: unknown): T[] => {
	const payload = extractPayload(raw);

	if (Array.isArray(payload)) {
		return payload as T[];
	}

	const payloadRecord = toRecord(payload);
	const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.results, payloadRecord.data];

	for (const candidate of candidates) {
		if (Array.isArray(candidate)) {
			return candidate as T[];
		}
	}

	return [];
};

export const getAdminNotificationsSummary = async () => {
	const response = await api.get("/admin/notifications/summary");
	const payload = extractPayload(response.data);
	return toRecord(payload);
};

export const createAdminNotification = async (payload: {
	title: string;
	message: string;
	user_id?: number;
}) => {
	const normalizedPayload: UnknownRecord = {
		title: payload.title,
		message: payload.message,
	};

	if (typeof payload.user_id === "number") {
		normalizedPayload.user_ids = [payload.user_id];
	}

	const response = await api.post("/admin/notifications", normalizedPayload);
	return extractPayload(response.data);
};

export const sendAdminBroadcastNotification = async (payload: {
	title: string;
	message: string;
	audience?: string;
}) => {
	const response = await api.post("/admin/notifications/broadcast", {
		title: payload.title,
		message: payload.message,
		audience: payload.audience ?? "all",
	});
	return extractPayload(response.data);
};

export const getAdminEmailNotifications = async () => {
	const response = await api.get("/admin/email-templates");
	const items = extractArrayPayload<UnknownRecord>(response.data);
	return items;
};

export const getAdminEmailNotificationLogs = async () => {
	const response = await api.get("/admin/email-notifications/logs");
	const items = extractArrayPayload<UnknownRecord>(response.data);
	return items;
};

export const createAdminEmailNotification = async (payload: {
	subject: string;
	recipient_email: string;
	message: string;
	type: string;
}) => {
	const response = await api.post("/admin/email-notifications", {
		subject: payload.subject,
		recipient_email: payload.recipient_email,
		body: payload.message,
		type: payload.type,
	});
	return extractPayload(response.data);
};

export const getBiometricDevices = async () => {
	const response = await api.get("/biometric/devices");
	return {
		items: extractArrayPayload<UnknownRecord>(response.data),
		raw: response.data,
	};
};

export const createBiometricDevice = async (payload: {
	name: string;
	ip_address: string;
	location?: string;
	port?: number;
}) => {
	const response = await api.post("/biometric/devices", {
		name: payload.name,
		endpoint_url: `http://${payload.ip_address}${payload.port ? `:${payload.port}` : ""}`,
		location: payload.location,
		payload: {
			ip_address: payload.ip_address,
			port: payload.port,
		},
	});
	return extractPayload(response.data);
};

export const syncBiometricAttendance = async (payload: { device_id: string | number }) => {
	const response = await api.post("/biometric/sync-attendance", {
		biometric_device_id: payload.device_id,
	});
	return extractPayload(response.data);
};

export const getAuditLogs = async () => {
	const response = await api.get("/admin/audit-logs");
	return {
		items: extractArrayPayload<UnknownRecord>(response.data),
		raw: response.data,
	};
};

export const getAuditLogById = async (id: string | number) => {
	const response = await api.get(`/admin/audit-logs/${id}`);
	const payload = extractPayload(response.data);
	return toRecord(payload);
};

export const downloadImportTemplate = async () => {
	const response = await api.get("/admin/import/template", {
		responseType: "blob",
	});
	return response.data as Blob;
};

export const importUsers = async (formData: FormData) => {
	const response = await api.post("/admin/import/users", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return extractPayload(response.data);
};

export const importEmployees = async (formData: FormData) => {
	const response = await api.post("/admin/import/employees", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return extractPayload(response.data);
};