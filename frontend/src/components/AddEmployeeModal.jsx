import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const initialFormState = {
  FullName: '',
  Department: '',
  JobTitle: '',
  Email: '',
  Status: 'Active',
  HireDate: ''
};

const AddEmployeeModal = ({ isOpen, onClose, onSubmit, employee }) => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState(() => ({
    ...initialFormState,
    HireDate: getTodayDateString()
  }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        FullName: employee.FullName || '',
        Department: employee.Department || '',
        JobTitle: employee.JobTitle || '',
        Email: employee.Email || '',
        Status: employee.Status || 'Active',
        HireDate: employee.HireDate ? employee.HireDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        ...initialFormState,
        HireDate: getTodayDateString()
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.FullName.trim()) newErrors.FullName = 'Full name is required';
    if (!formData.Department) newErrors.Department = 'Department is required';
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = 'Email address is invalid';
    }
    if (!formData.HireDate) newErrors.HireDate = 'Hire date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{employee ? 'Edit Employee Details' : 'Register New Employee'}</h3>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              
              <div className="form-group form-group-full">
                <label className="form-label" htmlFor="emp-FullName">Full Name *</label>
                <input
                  type="text"
                  id="emp-FullName"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleChange}
                  placeholder="e.g. Alice Johnson"
                  className="form-input"
                />
                {errors.FullName && <span className="form-error-msg">{errors.FullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-Email">Email Address *</label>
                <input
                  type="email"
                  id="emp-Email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="e.g. email@company.com"
                  className="form-input"
                />
                {errors.Email && <span className="form-error-msg">{errors.Email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-Department">Department *</label>
                <select
                  id="emp-Department"
                  name="Department"
                  value={formData.Department}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="IT">IT Support</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales & Business Dev</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
                {errors.Department && <span className="form-error-msg">{errors.Department}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-JobTitle">Job Title</label>
                <input
                  type="text"
                  id="emp-JobTitle"
                  name="JobTitle"
                  value={formData.JobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Cloud Architect"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-HireDate">Hire Date *</label>
                <input
                  type="date"
                  id="emp-HireDate"
                  name="HireDate"
                  value={formData.HireDate}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.HireDate && <span className="form-error-msg">{errors.HireDate}</span>}
              </div>

              <div className="form-group form-group-full">
                <label className="form-label" htmlFor="emp-Status">Status *</label>
                <select
                  id="emp-Status"
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {employee ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
