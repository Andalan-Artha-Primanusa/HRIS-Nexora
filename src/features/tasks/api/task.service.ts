import { api } from '@/shared/api/httpClient';

export const taskService = {
  getTasks: (params?: Record<string, string>) => {
    return api.get('/tasks', { params });
  },

  getTask: (id: string | number) => {
    return api.get(`/tasks/${id}`);
  },

  createTask: (data: any) => {
    return api.post('/tasks', data);
  },

  updateTask: (id: string | number, data: any) => {
    return api.put(`/tasks/${id}`, data);
  },

  deleteTask: (id: string | number) => {
    return api.delete(`/tasks/${id}`);
  },

  getMyTasks: () => {
    return api.get('/my/tasks');
  },
};
