import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Laptop, CheckCircle2, Package, Plus, ArrowRight } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { assetService } from '../services/assetService';

const DashboardPage = () => {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [empData, assetData] = await Promise.all([
          employeeService.getEmployees(),
          assetService.getAssets()
        ]);
        setEmployees(empData);
        setAssets(assetData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: '1rem' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Make sure the backend is running on </p>
      </div>
    );
  }

  // Metric calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.Status === 'Active').length;
  const totalAssets = assets.length;
  const assignedAssets = assets.filter(a => a.Status === 'Assigned').length;
  const availableAssets = assets.filter(a => a.Status === 'Available').length;
  const maintenanceAssets = assets.filter(a => a.Status === 'Maintenance').length;

  const assignmentRate = totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;

  // Asset type breakdown
  const typeCounts = assets.reduce((acc, asset) => {
    const type = asset.AssetType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typePercentages = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percentage: totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // SVG circular progress settings
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (assignmentRate / 100) * circumference;

  // Unassigned Assets preview
  const unassignedAssetsPreview = assets.filter(a => !a.AssignedToEmployeeId).slice(0, 3);



  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Operations Dashboard</h1>
        <p className="page-subtitle">Unified summary of organizational inventory and personnel assignments.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper primary">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{totalEmployees}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {activeEmployees} Active Members
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper success">
            <Laptop size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Assets</span>
            <span className="stat-value">{totalAssets}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Across {Object.keys(typeCounts).length} Categories
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper warning">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">In-Use Assets</span>
            <span className="stat-value">{assignedAssets}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {assignmentRate}% Utilization Rate
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper accent">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Available Stock</span>
            <span className="stat-value">{availableAssets}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {maintenanceAssets} Under Maintenance
            </span>
          </div>
        </div>
      </div>

      {/* Visualizations Panel */}
      <div className="visuals-grid">

        {/* Category Breakdown (Bar Graph) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-header">
            <h3>Asset Category Distribution</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sorted by count</span>
          </div>

          <div className="asset-type-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {typePercentages.length > 0 ? (
              typePercentages.map((item) => (
                <div className="asset-type-item" key={item.type}>
                  <div className="asset-type-meta">
                    <span className="asset-type-label">{item.type}s</span>
                    <span className="asset-type-count">{item.count} items ({item.percentage}%)</span>
                  </div>
                  <div className="asset-bar-bg">
                    <div className="asset-bar-fill" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No assets registered.
              </p>
            )}
          </div>
        </div>

        {/* Utilization Gauge */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ alignSelf: 'flex-start', marginBottom: '1.5rem' }}>Asset Assignment</h3>

          <div className="progress-ring-container" style={{ position: 'relative' }}>
            <svg width="120" height="120" className="progress-ring-svg">
              <circle
                r={radius}
                cx="60"
                cy="60"
                className="progress-ring-bg"
                strokeWidth="8"
              />
              <circle
                r={radius}
                cx="60"
                cy="60"
                className="progress-ring-fill"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{assignmentRate}%</span>
              <span className="progress-subtext">Assigned</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', width: '100%', justifyContent: 'space-around', fontSize: '0.85rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block', marginRight: '0.4rem' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned: </span>
              <strong>{assignedAssets}</strong>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'inline-block', marginRight: '0.4rem' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Stock: </span>
              <strong>{availableAssets}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Stock Previews */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Quick Task Actions */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Administration Shortcuts</h3>
          <div className="quick-actions-list">
            <Link to="/employees?add=true" className="quick-action-item" style={{ textDecoration: 'none' }}>
              <div className="quick-action-info">
                <span className="quick-action-title">Add Employee</span>
                <span className="quick-action-desc">Register a new team member and details.</span>
              </div>
              <Plus size={16} style={{ color: 'var(--primary)' }} />
            </Link>
            <Link to="/assets?add=true" className="quick-action-item" style={{ textDecoration: 'none' }}>
              <div className="quick-action-info">
                <span className="quick-action-title">Add Hardware Asset</span>
                <span className="quick-action-desc">Register laptops, screens, devices.</span>
              </div>
              <Plus size={16} style={{ color: 'var(--primary)' }} />
            </Link>
            <Link to="/assets" className="quick-action-item" style={{ textDecoration: 'none' }}>
              <div className="quick-action-info">
                <span className="quick-action-title">Review Asset Logs</span>
                <span className="quick-action-desc">View hardware allocation records.</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
            </Link>
          </div>
        </div>

        {/* Unassigned Stock Preview */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Unassigned Inventory Preview</h3>
          <div className="quick-actions-list">
            {unassignedAssetsPreview.length > 0 ? (
              unassignedAssetsPreview.map(asset => (
                <div key={asset.AssetId} className="quick-action-item">
                  <div className="quick-action-info">
                    <span className="quick-action-title" style={{ color: 'var(--primary)', fontWeight: 600 }}>{asset.AssetTag}</span>
                    <span className="quick-action-desc">{asset.AssetType} — {asset.Model || 'Generic model'}</span>
                  </div>
                  <span className="badge badge-success">In Stock</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No unassigned items available. All hardware allocated!
              </div>
            )}
            {assets.filter(a => !a.AssignedToEmployeeId).length > 3 && (
              <Link to="/assets" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <span>View all unassigned assets</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
