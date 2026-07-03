import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import AssetTable from '../components/AssetTable';
import AddAssetModal from '../components/AddAssetModal';

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null); // If editing

  const location = useLocation();
  const navigate = useNavigate();

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [assetData, empData] = await Promise.all([
        assetService.getAssets(),
        employeeService.getEmployees()
      ]);
      setAssets(assetData);
      setEmployees(empData);
    } catch (error) {
      console.error('Error loading assets page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle URL shortcut triggers (e.g. ?add=true from Dashboard)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setSelectedAsset(null);
      setIsModalOpen(true);
      navigate('/assets', { replace: true }); // Clear URL parameters
    }
  }, [location, navigate]);

  // Handle searching and filtering
  useEffect(() => {
    let result = [...assets];

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        asset => 
          asset.AssetTag.toLowerCase().includes(term) || 
          (asset.Model && asset.Model.toLowerCase().includes(term)) ||
          (asset.SerialNumber && asset.SerialNumber.toLowerCase().includes(term))
      );
    }

    if (typeFilter !== '') {
      result = result.filter(asset => asset.AssetType === typeFilter);
    }

    if (statusFilter !== '') {
      result = result.filter(asset => asset.Status === statusFilter);
    }

    setFilteredAssets(result);
  }, [assets, searchTerm, typeFilter, statusFilter]);

  // Modal form submissions
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedAsset) {
        // Edit flow
        await assetService.updateAsset(selectedAsset.AssetId, formData);
      } else {
        // Create flow
        await assetService.createAsset(formData);
      }
      setIsModalOpen(false);
      setSelectedAsset(null);
      await loadData();
    } catch (err) {
      console.error('Error saving asset:', err);
      alert('Failed to save asset configuration. Check that asset tag is unique.');
    }
  };

  // Trigger editing
  const handleEditClick = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  // Trigger quick unassign from table
  const handleUnassignClick = async (assetId) => {
    const asset = assets.find(a => a.AssetId === assetId);
    if (window.confirm(`Are you sure you want to unassign ${asset?.AssetTag || 'this asset'} from its user? This returns it to Available Stock.`)) {
      try {
        await assetService.assignAsset(assetId, null);
        await loadData();
      } catch (err) {
        console.error('Error unassigning asset:', err);
        alert('Failed to unassign asset.');
      }
    }
  };

  // Trigger deletion
  const handleDeleteClick = async (assetId) => {
    const asset = assets.find(a => a.AssetId === assetId);
    let confirmMsg = `Are you sure you want to delete asset ${asset?.AssetTag || 'this asset'}?`;
    if (asset?.Status === 'Assigned') {
      confirmMsg += `\n\nWarning: This asset is currently assigned. Deleting it will remove the allocation record entirely.`;
    }

    if (window.confirm(confirmMsg)) {
      try {
        await assetService.deleteAsset(assetId);
        await loadData();
      } catch (err) {
        console.error('Error deleting asset:', err);
        alert('Failed to delete asset.');
      }
    }
  };

  const handleOpenAddModal = () => {
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Hardware Inventory</h1>
          <p className="page-subtitle">Track, register, and allocate hardware configurations and items across teams.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Searching & Filtering Panel */}
      <div className="card table-actions-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search by tag, model, serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filters:</span>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Laptop">Laptop</option>
            <option value="Monitor">Monitor</option>
            <option value="Phone">Phone</option>
            <option value="Tablet">Tablet</option>
            <option value="Storage">Storage/Servers</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available (In Stock)</option>
            <option value="Assigned">Assigned (In Use)</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading inventory records...</p>
        </div>
      ) : (
        <AssetTable
          assets={filteredAssets}
          employees={employees}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onUnassign={handleUnassignClick}
        />
      )}

      {/* Registration/Edit Modal */}
      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        asset={selectedAsset}
        employees={employees}
      />
    </div>
  );
};

export default AssetsPage;
