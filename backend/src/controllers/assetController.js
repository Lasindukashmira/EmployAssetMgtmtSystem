/**
 * src/controllers/assetController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all CRUD + assignment operations for Assets.
 * Reads/writes from the in-memory store (src/data/store.js via db.js).
 */

// const store = require('../config/db');
const { sql, getPool } = require('../config/db');
// ── GET /api/assets ───────────────────────────────────────────────────────────
const getAllAssets = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.query('SELECT * FROM Assets');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/assets/:id ───────────────────────────────────────────────────────
const getAssetById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Assets WHERE AssetId = @id");

    if (!result.recordset.length) {
      const err = new Error(`Asset with ID ${id} not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/assets ──────────────────────────────────────────────────────────
const createAsset = async (req, res, next) => {
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

    if (!AssetTag || !AssetType) {
      return res.status(400).json({
        success: false,
        message: "AssetTag and AssetType are required",
      });
    }

    const pool = await getPool();

    // Check AssetTag uniqueness
    const tagCheck = await pool
      .request()
      .input("AssetTag", sql.VarChar(50), AssetTag.trim().toUpperCase())
      .query(`
        SELECT AssetId
        FROM Assets
        WHERE AssetTag = @AssetTag
      `);

    if (tagCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Asset tag "${AssetTag}" already exists`,
      });
    }

    let employeeId = null;

    if (AssignedToEmployeeId) {
      employeeId = parseInt(AssignedToEmployeeId);

      const empCheck = await pool
        .request()
        .input("EmployeeId", sql.Int, employeeId)
        .query(`
          SELECT EmployeeId
          FROM Employees
          WHERE EmployeeId = @EmployeeId
        `);

      if (empCheck.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Employee with ID ${employeeId} not found`,
        });
      }
    }

    let resolvedStatus = Status || "Available";

    if (employeeId) {
      resolvedStatus = "Assigned";
    } else if (resolvedStatus === "Assigned") {
      resolvedStatus = "Available";
    }

    const result = await pool
      .request()
      .input("AssetTag", sql.VarChar(50), AssetTag.trim().toUpperCase())
      .input("AssetType", sql.VarChar(50), AssetType)
      .input("Model", sql.VarChar(100), Model || null)
      .input("SerialNumber", sql.VarChar(100), SerialNumber || null)
      .input("Status", sql.VarChar(20), resolvedStatus)
      .input("AssignedToEmployeeId", sql.Int, employeeId)
      .input("PurchaseDate", sql.Date, PurchaseDate || null)
      .query(`
        INSERT INTO Assets (
          AssetTag,
          AssetType,
          Model,
          SerialNumber,
          Status,
          AssignedToEmployeeId,
          PurchaseDate
        )
        OUTPUT INSERTED.*
        VALUES (
          @AssetTag,
          @AssetType,
          @Model,
          @SerialNumber,
          @Status,
          @AssignedToEmployeeId,
          @PurchaseDate
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

// ── PUT /api/assets/:id ───────────────────────────────────────────────────────
const updateAsset = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    const pool = await getPool();

    // Check asset exists
    const assetResult = await pool
      .request()
      .input("AssetId", sql.Int, id)
      .query("SELECT * FROM Assets WHERE AssetId = @AssetId");

    if (assetResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Asset with ID ${id} not found`,
      });
    }

    const asset = assetResult.recordset[0];

    const {
      AssetType,
      Model,
      SerialNumber,
      Status,
      AssignedToEmployeeId,
      PurchaseDate,
    } = req.body;

    // Determine employee ID
    let employeeId = asset.AssignedToEmployeeId;

    if (AssignedToEmployeeId !== undefined) {
      employeeId =
        AssignedToEmployeeId === null || AssignedToEmployeeId === ""
          ? null
          : parseInt(AssignedToEmployeeId);

      if (employeeId !== null) {
        const employeeResult = await pool
          .request()
          .input("EmployeeId", sql.Int, employeeId)
          .query(
            "SELECT EmployeeId FROM Employees WHERE EmployeeId = @EmployeeId"
          );

        if (employeeResult.recordset.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Employee with ID ${employeeId} not found`,
          });
        }
      }
    }

    // Resolve status
    let resolvedStatus = Status ?? asset.Status;

    if (employeeId !== null) {
      resolvedStatus = "Assigned";
    } else if (resolvedStatus === "Assigned") {
      resolvedStatus = "Available";
    }

    // Update asset
    const updateResult = await pool
      .request()
      .input("AssetId", sql.Int, id)
      .input("AssetType", sql.VarChar(50), AssetType ?? asset.AssetType)
      .input("Model", sql.VarChar(100), Model ?? asset.Model)
      .input(
        "SerialNumber",
        sql.VarChar(100),
        SerialNumber ?? asset.SerialNumber
      )
      .input("Status", sql.VarChar(20), resolvedStatus)
      .input("AssignedToEmployeeId", sql.Int, employeeId)
      .input("PurchaseDate", sql.Date, PurchaseDate ?? asset.PurchaseDate)
      .query(`
        UPDATE Assets
        SET
          AssetType = @AssetType,
          Model = @Model,
          SerialNumber = @SerialNumber,
          Status = @Status,
          AssignedToEmployeeId = @AssignedToEmployeeId,
          PurchaseDate = @PurchaseDate
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId;
      `);

    res.json({
      success: true,
      data: updateResult.recordset[0],
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/assets/:id/assign ──────────────────────────────────────────────
const assignAsset = async (req, res, next) => {
  try {
    const assetId = parseInt(req.params.id, 10);

    if (isNaN(assetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    const rawId = req.body.AssignedToEmployeeId;

    const employeeId =
      rawId !== null && rawId !== undefined && rawId !== ""
        ? parseInt(rawId, 10)
        : null;

    const pool = await getPool();

    // Check asset exists
    const assetResult = await pool
      .request()
      .input("AssetId", sql.Int, assetId)
      .query("SELECT AssetId FROM Assets WHERE AssetId = @AssetId");

    if (assetResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Asset with ID ${assetId} not found`,
      });
    }

    // Check employee exists
    if (employeeId !== null) {
      const employeeResult = await pool
        .request()
        .input("EmployeeId", sql.Int, employeeId)
        .query(
          "SELECT EmployeeId FROM Employees WHERE EmployeeId = @EmployeeId"
        );

      if (employeeResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Employee with ID ${employeeId} not found`,
        });
      }
    }

    // Assign or unassign
    const result = await pool
      .request()
      .input("AssetId", sql.Int, assetId)
      .input("EmployeeId", sql.Int, employeeId)
      .input(
        "Status",
        sql.VarChar(20),
        employeeId !== null ? "Assigned" : "Available"
      )
      .query(`
        UPDATE Assets
        SET
            AssignedToEmployeeId = @EmployeeId,
            Status = @Status
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId;
      `);

    res.json({
      success: true,
      data: result.recordset[0],
    });

  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/assets/:id ────────────────────────────────────────────────────


const deleteAsset = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("AssetId", sql.Int, id)
      .query(`
        DELETE FROM Assets
        OUTPUT DELETED.*
        WHERE AssetId = @AssetId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Asset with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      message: "Asset deleted successfully",
      data: result.recordset[0], // optional: returns deleted row
    });

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
