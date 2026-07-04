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

const { sql, getPool } = require('../config/db');

// ── GET /api/employees ────────────────────────────────────────────────────────

const getAllEmployees = async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .query("SELECT * FROM Employees");

    res.json({
      success: true,
      data: result.recordset,
    });

  } catch (err) {
    next(err);
  }
};


// ── GET /api/employees/:id ────────────────────────────────────────────────────
const getEmployeeById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getPool();
    const result = await pool.request().input("EmployeeId", sql.Int, id).query("SELECT * FROM Employees WHERE EmployeeId = @EmployeeId");

    if (!result.recordset.length) {
      const err = new Error(`Employee with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/employees ───────────────────────────────────────────────────────

const createEmployee = async (req, res, next) => {
  try {
    const {
      FullName,
      Department,
      JobTitle,
      Email,
      Status,
      HireDate,
    } = req.body;

    // Validate required fields
    if (!FullName || !Department || !Email || !Status) {
      return res.status(400).json({
        success: false,
        message: "FullName, Department, Email, and Status are required",
      });
    }

    const pool = await getPool();

    // Normalize email early
    const normalizedEmail = Email.trim().toLowerCase();

    // Check email uniqueness
    const emailCheck = await pool
      .request()
      .input("Email", sql.VarChar(255), normalizedEmail)
      .query(`
        SELECT EmployeeId
        FROM Employees
        WHERE Email = @Email
      `);

    if (emailCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: `An employee with email "${Email}" already exists`,
      });
    }

    // Insert employee
    const result = await pool
      .request()
      .input("FullName", sql.VarChar(255), FullName.trim())
      .input("Department", sql.VarChar(100), Department)
      .input("JobTitle", sql.VarChar(100), JobTitle?.trim() || null)
      .input("Email", sql.VarChar(255), normalizedEmail)
      .input("Status", sql.VarChar(50), Status)
      .input("HireDate", sql.Date, HireDate || null)
      .query(`
        INSERT INTO Employees (
          FullName,
          Department,
          JobTitle,
          Email,
          Status,
          HireDate
        )
        OUTPUT INSERTED.*
        VALUES (
          @FullName,
          @Department,
          @JobTitle,
          @Email,
          @Status,
          @HireDate
        );
      `);

    res.status(201).json({
      success: true,
      data: result.recordset[0],
    });

  } catch (err) {
    next(err);
  }
};



// ── PUT /api/employees/:id ────────────────────────────────────────────────────

const updateEmployee = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Employee ID",
      });
    }

    const {
      FullName,
      Department,
      JobTitle,
      Email,
      Status,
      HireDate,
    } = req.body;

    const pool = await getPool();

    // Check employee exists
    const existing = await pool
      .request()
      .input("EmployeeId", sql.Int, id)
      .query("SELECT * FROM Employees WHERE EmployeeId = @EmployeeId");

    if (existing.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`,
      });
    }

    const current = existing.recordset[0];

    // Email uniqueness check (exclude current employee)
    if (Email) {
      const emailCheck = await pool
        .request()
        .input("Email", sql.VarChar(255), Email.trim().toLowerCase())
        .input("EmployeeId", sql.Int, id)
        .query(`
          SELECT EmployeeId
          FROM Employees
          WHERE Email = @Email AND EmployeeId <> @EmployeeId
        `);

      if (emailCheck.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: `An employee with email "${Email}" already exists`,
        });
      }
    }

    // Update employee
    const result = await pool
      .request()
      .input("EmployeeId", sql.Int, id)
      .input("FullName", sql.VarChar(255), FullName ?? current.FullName)
      .input("Department", sql.VarChar(100), Department ?? current.Department)
      .input("JobTitle", sql.VarChar(100), JobTitle ?? current.JobTitle)
      .input(
        "Email",
        sql.VarChar(255),
        Email ? Email.trim().toLowerCase() : current.Email
      )
      .input("Status", sql.VarChar(50), Status ?? current.Status)
      .input("HireDate", sql.Date, HireDate ?? current.HireDate)
      .query(`
        UPDATE Employees
        SET
          FullName = @FullName,
          Department = @Department,
          JobTitle = @JobTitle,
          Email = @Email,
          Status = @Status,
          HireDate = @HireDate
        OUTPUT INSERTED.*
        WHERE EmployeeId = @EmployeeId;
      `);

    res.json({
      success: true,
      data: result.recordset[0],
    });

  } catch (err) {
    next(err);
  }
};


// ── DELETE /api/employees/:id ─────────────────────────────────────────────────
const deleteEmployee = async (req, res, next) => {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Employee ID",
      });
    }

    await transaction.begin();

    const request = new sql.Request(transaction);

    // Check employee exists
    const employeeResult = await request
      .input("EmployeeId", sql.Int, id)
      .query("SELECT EmployeeId FROM Employees WHERE EmployeeId = @EmployeeId");

    if (employeeResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`,
      });
    }

    // Unassign assets first
    const unassignResult = await request
      .input("EmployeeId", sql.Int, id)
      .query(`
        UPDATE Assets
        SET
          AssignedToEmployeeId = NULL,
          Status = 'Available'
        WHERE AssignedToEmployeeId = @EmployeeId;
      `);

    const unassignedCount = unassignResult.rowsAffected[0];

    // Delete employee
    await request
      .input("EmployeeId", sql.Int, id)
      .query(`
        DELETE FROM Employees
        WHERE EmployeeId = @EmployeeId;
      `);

    await transaction.commit();

    res.json({
      success: true,
      message: `Employee deleted. ${unassignedCount} asset(s) returned to Available stock.`,
    });

  } catch (err) {
    try {
      await transaction.rollback();
    } catch (_) { }

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
