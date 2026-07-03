/**
 * src/data/store.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory data store — mirrors the Azure SQL schema exactly.
 * When Azure SQL is provisioned, ONLY this file and src/config/db.js need
 * to change. All controllers, routes, and middleware stay identical.
 *
 * Schema reference:
 *   Employees(EmployeeId, FullName, Department, JobTitle, Email, Status, HireDate, CreatedAt)
 *   Assets(AssetId, AssetTag, AssetType, Model, SerialNumber, Status,
 *          AssignedToEmployeeId, PurchaseDate, CreatedAt)
 */

const store = {
  // ─── EMPLOYEES ──────────────────────────────────────────────────────────────
  _nextEmployeeId: 5,

  employees: [
    {
      EmployeeId: 1,
      FullName: 'Alice Johnson',
      Department: 'IT',
      JobTitle: 'Cloud Architect',
      Email: 'alice.j@company.com',
      Status: 'Active',
      HireDate: '2024-03-15',
      CreatedAt: new Date('2024-03-15').toISOString(),
    },
    {
      EmployeeId: 2,
      FullName: 'Bob Smith',
      Department: 'HR',
      JobTitle: 'Talent Acquisition',
      Email: 'bob.smith@company.com',
      Status: 'Active',
      HireDate: '2023-08-10',
      CreatedAt: new Date('2023-08-10').toISOString(),
    },
    {
      EmployeeId: 3,
      FullName: 'Charlie Brown',
      Department: 'Finance',
      JobTitle: 'Accountant',
      Email: 'charlie.b@company.com',
      Status: 'Active',
      HireDate: '2025-01-20',
      CreatedAt: new Date('2025-01-20').toISOString(),
    },
    {
      EmployeeId: 4,
      FullName: 'Diana Prince',
      Department: 'Security',
      JobTitle: 'Security Engineer',
      Email: 'diana.p@company.com',
      Status: 'Inactive',
      HireDate: '2022-11-05',
      CreatedAt: new Date('2022-11-05').toISOString(),
    },
  ],

  // ─── ASSETS ─────────────────────────────────────────────────────────────────
  _nextAssetId: 6,

  assets: [
    {
      AssetId: 1,
      AssetTag: 'LAP-001',
      AssetType: 'Laptop',
      Model: 'MacBook Pro 16"',
      SerialNumber: 'C02DF123XYZ',
      Status: 'Assigned',
      AssignedToEmployeeId: 1,
      PurchaseDate: '2024-03-20',
      CreatedAt: new Date('2024-03-20').toISOString(),
    },
    {
      AssetId: 2,
      AssetTag: 'MON-042',
      AssetType: 'Monitor',
      Model: 'Dell UltraSharp 27"',
      SerialNumber: 'MX-098765',
      Status: 'Assigned',
      AssignedToEmployeeId: 1,
      PurchaseDate: '2024-03-20',
      CreatedAt: new Date('2024-03-20').toISOString(),
    },
    {
      AssetId: 3,
      AssetTag: 'PHN-102',
      AssetType: 'Phone',
      Model: 'iPhone 15 Pro',
      SerialNumber: 'DNPM12345',
      Status: 'Available',
      AssignedToEmployeeId: null,
      PurchaseDate: '2024-05-12',
      CreatedAt: new Date('2024-05-12').toISOString(),
    },
    {
      AssetId: 4,
      AssetTag: 'LAP-002',
      AssetType: 'Laptop',
      Model: 'ThinkPad X1 Carbon',
      SerialNumber: 'L3-AB1234',
      Status: 'Assigned',
      AssignedToEmployeeId: 3,
      PurchaseDate: '2025-01-22',
      CreatedAt: new Date('2025-01-22').toISOString(),
    },
    {
      AssetId: 5,
      AssetTag: 'MON-043',
      AssetType: 'Monitor',
      Model: 'LG 34" Ultrawide',
      SerialNumber: 'LG-778899',
      Status: 'Available',
      AssignedToEmployeeId: null,
      PurchaseDate: '2024-10-15',
      CreatedAt: new Date('2024-10-15').toISOString(),
    },
  ],
};

module.exports = store;
