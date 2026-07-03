/**
 * src/controllers/employeeController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all CRUD operations for Employees.
 * Reads/writes from the in-memory store (src/data/store.js via db.js).
 *
 * Azure SQL migration path:
 *   Replace the array operations below with sql.query() calls using
 *   the pool from db.js — the route signatures remain identical.
 */

const store = require('../config/db');

// ── GET /api/employees ────────────────────────────────────────────────────────
const getAllEmployees = (req, res, next) => {
  try {
    res.json({ success: true, data: store.employees });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/employees/:id ────────────────────────────────────────────────────
const getEmployeeById = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const employee = store.employees.find((e) => e.EmployeeId === id);

    if (!employee) {
      const err = new Error(`Employee with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/employees ───────────────────────────────────────────────────────
const createEmployee = (req, res, next) => {
  try {
    const { FullName, Department, JobTitle, Email, Status, HireDate } = req.body;

    // Validate required fields
    if (!FullName || !Department || !Email || !Status) {
      const err = new Error('FullName, Department, Email, and Status are required');
      err.statusCode = 400;
      return next(err);
    }

    // Check email uniqueness
    const emailExists = store.employees.some(
      (e) => e.Email.toLowerCase() === Email.toLowerCase()
    );
    if (emailExists) {
      const err = new Error(`An employee with email "${Email}" already exists`);
      err.statusCode = 409;
      return next(err);
    }

    const newEmployee = {
      EmployeeId: store._nextEmployeeId++,
      FullName: FullName.trim(),
      Department,
      JobTitle: JobTitle ? JobTitle.trim() : null,
      Email: Email.trim().toLowerCase(),
      Status,
      HireDate: HireDate || null,
      CreatedAt: new Date().toISOString(),
    };

    store.employees.push(newEmployee);

    res.status(201).json({ success: true, data: newEmployee });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/employees/:id ────────────────────────────────────────────────────
const updateEmployee = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = store.employees.findIndex((e) => e.EmployeeId === id);

    if (index === -1) {
      const err = new Error(`Employee with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    const { FullName, Department, JobTitle, Email, Status, HireDate } = req.body;

    // Check email uniqueness (exclude current record)
    if (Email) {
      const emailExists = store.employees.some(
        (e) => e.Email.toLowerCase() === Email.toLowerCase() && e.EmployeeId !== id
      );
      if (emailExists) {
        const err = new Error(`An employee with email "${Email}" already exists`);
        err.statusCode = 409;
        return next(err);
      }
    }

    // Merge updates — only overwrite provided fields
    store.employees[index] = {
      ...store.employees[index],
      ...(FullName !== undefined && { FullName: FullName.trim() }),
      ...(Department !== undefined && { Department }),
      ...(JobTitle !== undefined && { JobTitle: JobTitle ? JobTitle.trim() : null }),
      ...(Email !== undefined && { Email: Email.trim().toLowerCase() }),
      ...(Status !== undefined && { Status }),
      ...(HireDate !== undefined && { HireDate }),
    };

    res.json({ success: true, data: store.employees[index] });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/employees/:id ─────────────────────────────────────────────────
const deleteEmployee = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const index = store.employees.findIndex((e) => e.EmployeeId === id);

    if (index === -1) {
      const err = new Error(`Employee with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    // Data integrity — unassign any assets linked to this employee
    let unassignedCount = 0;
    store.assets.forEach((asset) => {
      if (asset.AssignedToEmployeeId === id) {
        asset.AssignedToEmployeeId = null;
        asset.Status = 'Available';
        unassignedCount++;
      }
    });

    store.employees.splice(index, 1);

    res.json({
      success: true,
      message: `Employee deleted. ${unassignedCount} asset(s) returned to Available stock.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
