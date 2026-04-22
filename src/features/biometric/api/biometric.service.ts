import { api } from "@/shared/api/httpClient";

export const biometricService = {
  getDevices: async () => {
    const response = await api.get('/biometric/devices');
    return response.data;
  },
  getDevice: async (id: string | number) => {
    const response = await api.get(`/biometric/devices/${id}`);
    return response.data;
  },
  createDevice: async (data: any) => {
    const response = await api.post('/biometric/devices', data);
    return response.data;
  },
  registerDevice: async (data: any) => {
    const response = await api.post('/biometric/devices', data);
    return response.data;
  },
  updateDevice: async (id: string | number, data: any) => {
    const response = await api.put(`/biometric/devices/${id}`, data);
    return response.data;
  },
  syncAttendance: async (deviceId?: string | number) => {
    const response = await api.post('/biometric/sync-attendance', { device_id: deviceId });
    return response.data;
  },
};
