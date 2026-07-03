import React from 'react';
import { Edit, Trash2, Mail, Briefcase, Calendar } from 'lucide-react';

const EmployeeTable = ({ employees, assets, onEdit, onDelete }) => {
  
  // Calculate how many assets are assigned to a specific employee
  const getAssetCount = (employeeId) => {
    if (!assets) return 0;
    return assets.filter(asset => asset.AssignedToEmployeeId === employeeId).length;
  };

  // Format date to local readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  if (employees.length === 0) {
    return (
      <div className="card empty-state">
        <Briefcase className="empty-state-icon" size={48} />
        <h4 className="empty-state-title">No Employees Found</h4>
        <p className="empty-state-desc">Get started by adding a new employee to the system.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Email</th>
              <th>Hire Date</th>
              <th>Status</th>
              <th>Assets</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.EmployeeId}>
                <td style={{ fontWeight: 600 }}>{employee.FullName}</td>
                <td>
                  <span className="badge badge-info" style={{ fontWeight: 500 }}>
                    {employee.Department}
                  </span>
                </td>
                <td>{employee.JobTitle || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{employee.Email}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{formatDate(employee.HireDate)}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${employee.Status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    {employee.Status}
                  </span>
                </td>
                <td>
                  <span className="badge-count" title={`${getAssetCount(employee.EmployeeId)} assets assigned`}>
                    {getAssetCount(employee.EmployeeId)}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button 
                      onClick={() => onEdit(employee)} 
                      className="table-btn"
                      title="Edit Employee"
                      aria-label={`Edit ${employee.FullName}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(employee.EmployeeId)} 
                      className="table-btn table-btn-danger"
                      title="Delete Employee"
                      aria-label={`Delete ${employee.FullName}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
