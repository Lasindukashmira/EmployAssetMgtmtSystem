/**
 * src/services/employeeService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All employee data flows through the Node.js/Express backend REST API.
 * localStorage is no longer used. The backend manages state in its
 * in-memory store (and later in Azure SQL — no frontend changes needed).
 */

import api from './api';

export const employeeService = {
  /** GET /api/employees */
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data.data;
  },

  /** GET /api/employees/:id */
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  /** POST /api/employees */
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data.data;
  },

  /** PUT /api/employees/:id */
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data.data;
  },

  /** DELETE /api/employees/:id */
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};
