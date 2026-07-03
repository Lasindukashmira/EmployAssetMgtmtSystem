/**
 * src/controllers/assetController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all CRUD + assignment operations for Assets.
 * Reads/writes from the in-memory store (src/data/store.js via db.js).
 */

const store = require('../config/db');

// ── GET /api/assets ───────────────────────────────────────────────────────────
const getAllAssets = (req, res, next) => {
  try {
    res.json({ success: true, data: store.assets });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/assets/:id ───────────────────────────────────────────────────────
const getAssetById = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const asset = store.assets.find((a) => a.AssetId === id);

    if (!asset) {
      const err = new Error(`Asset with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/assets ──────────────────────────────────────────────────────────
const createAsset = (req, res, next) => {
  try {
    const {
      AssetTag,
      AssetType,
      Model,
      SerialNumber,
      Status,
      AssignedToEmployeeId,
      PurchaseDate,
    } = req.body;

    // Validate required fields
    if (!AssetTag || !AssetType) {
      const err = new Error('AssetTag and AssetType are required');
      err.statusCode = 400;
      return next(err);
    }

    // Check AssetTag uniqueness
    const tagExists = store.assets.some(
      (a) => a.AssetTag.toUpperCase() === AssetTag.toUpperCase()
    );
    if (tagExists) {
      const err = new Error(`Asset tag "${AssetTag}" already exists`);
      err.statusCode = 409;
      return next(err);
    }

    // Validate assignee exists if provided
    const empId = AssignedToEmployeeId ? parseInt(AssignedToEmployeeId, 10) : null;
    if (empId !== null) {
      const employee = store.employees.find((e) => e.EmployeeId === empId);
      if (!employee) {
        const err = new Error(`Employee with ID ${empId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    }

    // Auto-set Status based on assignment
    let resolvedStatus = Status || 'Available';
    if (empId !== null) resolvedStatus = 'Assigned';
    else if (resolvedStatus === 'Assigned') resolvedStatus = 'Available';

    const newAsset = {
      AssetId: store._nextAssetId++,
      AssetTag: AssetTag.trim().toUpperCase(),
      AssetType,
      Model: Model ? Model.trim() : null,
      SerialNumber: SerialNumber ? SerialNumber.trim() : null,
      Status: resolvedStatus,
      AssignedToEmployeeId: empId,
      PurchaseDate: PurchaseDate || null,
      CreatedAt: new Date().toISOString(),
    };

    store.assets.push(newAsset);

    res.status(201).json({ success: true, data: newAsset });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/assets/:id ───────────────────────────────────────────────────────
const updateAsset = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = store.assets.findIndex((a) => a.AssetId === id);

    if (index === -1) {
      const err = new Error(`Asset with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    const {
      AssetType,
      Model,
      SerialNumber,
      Status,
      AssignedToEmployeeId,
      PurchaseDate,
    } = req.body;

    // Validate assignee if being changed
    const empId =
      AssignedToEmployeeId !== undefined
        ? AssignedToEmployeeId !== null && AssignedToEmployeeId !== ''
          ? parseInt(AssignedToEmployeeId, 10)
          : null
        : store.assets[index].AssignedToEmployeeId;

    if (empId !== null) {
      const employee = store.employees.find((e) => e.EmployeeId === empId);
      if (!employee) {
        const err = new Error(`Employee with ID ${empId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    }

    // Resolve status
    let resolvedStatus = Status !== undefined ? Status : store.assets[index].Status;
    if (empId !== null) resolvedStatus = 'Assigned';
    else if (resolvedStatus === 'Assigned') resolvedStatus = 'Available';

    store.assets[index] = {
      ...store.assets[index],
      ...(AssetType !== undefined && { AssetType }),
      ...(Model !== undefined && { Model: Model ? Model.trim() : null }),
      ...(SerialNumber !== undefined && {
        SerialNumber: SerialNumber ? SerialNumber.trim() : null,
      }),
      ...(PurchaseDate !== undefined && { PurchaseDate }),
      AssignedToEmployeeId: empId,
      Status: resolvedStatus,
    };

    res.json({ success: true, data: store.assets[index] });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/assets/:id/assign ──────────────────────────────────────────────
const assignAsset = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = store.assets.findIndex((a) => a.AssetId === id);

    if (index === -1) {
      const err = new Error(`Asset with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    const rawId = req.body.AssignedToEmployeeId;
    const empId =
      rawId !== null && rawId !== undefined && rawId !== ''
        ? parseInt(rawId, 10)
        : null;

    if (empId !== null) {
      const employee = store.employees.find((e) => e.EmployeeId === empId);
      if (!employee) {
        const err = new Error(`Employee with ID ${empId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    }

    store.assets[index].AssignedToEmployeeId = empId;
    store.assets[index].Status = empId !== null ? 'Assigned' : 'Available';

    res.json({ success: true, data: store.assets[index] });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/assets/:id ────────────────────────────────────────────────────
const deleteAsset = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = store.assets.findIndex((a) => a.AssetId === id);

    if (index === -1) {
      const err = new Error(`Asset with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    store.assets.splice(index, 1);

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  assignAsset,
  deleteAsset,
};
