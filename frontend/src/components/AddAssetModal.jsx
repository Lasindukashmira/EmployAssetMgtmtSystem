import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const initialFormState = {
  AssetTag: '',
  AssetType: '',
  Model: '',
  SerialNumber: '',
  Status: 'Available',
  AssignedToEmployeeId: '',
  PurchaseDate: ''
};

const AddAssetModal = ({ isOpen, onClose, onSubmit, asset, employees }) => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState(() => ({
    ...initialFormState,
    PurchaseDate: getTodayDateString()
  }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (asset) {
      setFormData({
        AssetTag: asset.AssetTag || '',
        AssetType: asset.AssetType || '',
        Model: asset.Model || '',
        SerialNumber: asset.SerialNumber || '',
        Status: asset.Status || 'Available',
        AssignedToEmployeeId: asset.AssignedToEmployeeId || '',
        PurchaseDate: asset.PurchaseDate ? asset.PurchaseDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        ...initialFormState,
        PurchaseDate: getTodayDateString()
      });
    }
    setErrors({});
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Dynamic logic: If assigning to an employee, automatically flip status to Assigned.
      // If unassigning, flip status back to Available (unless status is Maintenance/Retired).
      if (name === 'AssignedToEmployeeId') {
        if (value !== '') {
          updated.Status = 'Assigned';
        } else if (prev.Status === 'Assigned') {
          updated.Status = 'Available';
        }
      }
      
      // If user manually changes Status to something else:
      if (name === 'Status') {
        if (value !== 'Assigned') {
          updated.AssignedToEmployeeId = ''; // Clear assignee if status is not Assigned
        } else if (prev.AssignedToEmployeeId === '' && employees.length > 0) {
          // If status set to Assigned but no assignee is selected, keep it empty or default.
        }
      }
      
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.AssetTag.trim()) {
      newErrors.AssetTag = 'Asset tag is required';
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.AssetTag)) {
      newErrors.AssetTag = 'Asset tag can only contain letters, numbers, and dashes';
    }
    
    if (!formData.AssetType) newErrors.AssetType = 'Asset type is required';
    
    // If Status is set to Assigned, require an employee selection
    if (formData.Status === 'Assigned' && !formData.AssignedToEmployeeId) {
      newErrors.AssignedToEmployeeId = 'Assignee is required when status is Assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Parse employee ID to number if it is selected
      const payload = {
        ...formData,
        AssignedToEmployeeId: formData.AssignedToEmployeeId ? parseInt(formData.AssignedToEmployeeId, 10) : null
      };
      onSubmit(payload);
    }
  };

  // Filter to active employees for the assignment dropdown
  const activeEmployees = employees ? employees.filter(e => e.Status === 'Active') : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{asset ? 'Edit Asset Configuration' : 'Register New Hardware Asset'}</h3>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              
              <div className="form-group">
                <label className="form-label" htmlFor="asset-AssetTag">Asset Tag / ID *</label>
                <input
                  type="text"
                  id="asset-AssetTag"
                  name="AssetTag"
                  value={formData.AssetTag}
                  onChange={handleChange}
                  placeholder="e.g. LAP-104 or MON-025"
                  className="form-input"
                  disabled={!!asset} // Prevent changing unique key during edit
                />
                {errors.AssetTag && <span className="form-error-msg">{errors.AssetTag}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asset-AssetType">Asset Type *</label>
                <select
                  id="asset-AssetType"
                  name="AssetType"
                  value={formData.AssetType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Hardware Type</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Phone">Phone</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Storage">External Drive / Server</option>
                  <option value="Other">Other / Network Equipment</option>
                </select>
                {errors.AssetType && <span className="form-error-msg">{errors.AssetType}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asset-Model">Model Name</label>
                <input
                  type="text"
                  id="asset-Model"
                  name="Model"
                  value={formData.Model}
                  onChange={handleChange}
                  placeholder="e.g. ThinkPad T14 Gen 4"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asset-SerialNumber">Serial Number</label>
                <input
                  type="text"
                  id="asset-SerialNumber"
                  name="SerialNumber"
                  value={formData.SerialNumber}
                  onChange={handleChange}
                  placeholder="e.g. SN-8827XG7"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asset-PurchaseDate">Purchase Date</label>
                <input
                  type="date"
                  id="asset-PurchaseDate"
                  name="PurchaseDate"
                  value={formData.PurchaseDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="asset-Status">Operational Status *</label>
                <select
                  id="asset-Status"
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Available">Available (In Stock)</option>
                  <option value="Assigned">Assigned (In Use)</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label" htmlFor="asset-AssignedToEmployeeId">Assign to Employee</label>
                <select
                  id="asset-AssignedToEmployeeId"
                  name="AssignedToEmployeeId"
                  value={formData.AssignedToEmployeeId}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Leave Unassigned (In Stock)</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.EmployeeId} value={emp.EmployeeId}>
                      {emp.FullName} ({emp.Department} - {emp.JobTitle || 'Staff'})
                    </option>
                  ))}
                </select>
                {errors.AssignedToEmployeeId && <span className="form-error-msg">{errors.AssignedToEmployeeId}</span>}
              </div>

            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {asset ? 'Save Changes' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
