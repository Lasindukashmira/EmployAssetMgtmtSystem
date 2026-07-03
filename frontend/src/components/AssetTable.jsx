import React from 'react';
import { Edit, Trash2, UserMinus, Monitor, Smartphone, Laptop, Tablet, HardDrive, HelpCircle } from 'lucide-react';

const AssetTable = ({ assets, employees, onEdit, onDelete, onUnassign }) => {
  
  // Helper to resolve employee name by ID
  const getEmployeeName = (employeeId) => {
    if (!employeeId || !employees) return null;
    const emp = employees.find(e => e.EmployeeId === employeeId);
    return emp ? emp.FullName : 'Unknown';
  };

  // Helper to render type-specific icons
  const getTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('laptop')) return <Laptop size={16} />;
    if (t.includes('monitor')) return <Monitor size={16} />;
    if (t.includes('phone') || t.includes('mobile')) return <Smartphone size={16} />;
    if (t.includes('tablet') || t.includes('ipad')) return <Tablet size={16} />;
    if (t.includes('drive') || t.includes('server') || t.includes('storage')) return <HardDrive size={16} />;
    return <HelpCircle size={16} />;
  };

  // Helper for asset status badges
  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'available') return 'badge-success';
    if (s === 'assigned') return 'badge-info';
    if (s === 'maintenance') return 'badge-warning';
    if (s === 'retired') return 'badge-danger';
    return 'badge-secondary';
  };

  if (assets.length === 0) {
    return (
      <div className="card empty-state">
        <Monitor className="empty-state-icon" size={48} />
        <h4 className="empty-state-title">No Assets Found</h4>
        <p className="empty-state-desc">Get started by registering a new hardware asset.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Type</th>
              <th>Model</th>
              <th>Serial Number</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const employeeName = getEmployeeName(asset.AssignedToEmployeeId);
              return (
                <tr key={asset.AssetId}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {asset.AssetTag}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {getTypeIcon(asset.AssetType)}
                      </span>
                      <span>{asset.AssetType}</span>
                    </div>
                  </td>
                  <td>{asset.Model || '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
                    {asset.SerialNumber || '—'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(asset.Status)}`}>
                      {asset.Status}
                    </span>
                  </td>
                  <td>
                    {employeeName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 500 }}>{employeeName}</span>
                        {onUnassign && (
                          <button
                            onClick={() => onUnassign(asset.AssetId)}
                            className="table-btn table-btn-danger"
                            title="Unassign Asset"
                            style={{ padding: '2px', borderRadius: '4px' }}
                            aria-label={`Unassign asset ${asset.AssetTag} from ${employeeName}`}
                          >
                            <UserMinus size={12} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        In Stock
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        onClick={() => onEdit(asset)} 
                        className="table-btn"
                        title="Edit Asset"
                        aria-label={`Edit asset ${asset.AssetTag}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(asset.AssetId)} 
                        className="table-btn table-btn-danger"
                        title="Delete Asset"
                        aria-label={`Delete asset ${asset.AssetTag}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetTable;
