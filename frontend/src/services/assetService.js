/**
 * src/services/assetService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All asset data flows through the Node.js/Express backend REST API.
 * localStorage is no longer used.
 */

import api from './api';

export const assetService = {
  /** GET /api/assets */
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data.data;
  },

  /** GET /api/assets/:id */
  getAsset: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data.data;
  },

  /** POST /api/assets */
  createAsset: async (assetData) => {
    const response = await api.post('/assets', assetData);
    return response.data.data;
  },

  /** PUT /api/assets/:id */
  updateAsset: async (id, assetData) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data.data;
  },

  /** PATCH /api/assets/:id/assign — pass employeeId or null to unassign */
  assignAsset: async (id, employeeId) => {
    const response = await api.patch(`/assets/${id}/assign`, {
      AssignedToEmployeeId: employeeId,
    });
    return response.data.data;
  },

  /** DELETE /api/assets/:id */
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
};
