import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { assetService } from '../services/assetService';
import EmployeeTable from '../components/EmployeeTable';
import AddEmployeeModal from '../components/AddEmployeeModal';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // If editing

  const location = useLocation();
  const navigate = useNavigate();

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, assetData] = await Promise.all([
        employeeService.getEmployees(),
        assetService.getAssets()
      ]);
      setEmployees(empData);
      setAssets(assetData);
    } catch (error) {
      console.error('Error loading employees page data:', error);
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
      setSelectedEmployee(null);
      setIsModalOpen(true);
      navigate('/employees', { replace: true }); // Clear URL parameters
    }
  }, [location, navigate]);

  // Handle searching and filtering
  useEffect(() => {
    let result = [...employees];

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        emp => 
          emp.FullName.toLowerCase().includes(term) || 
          emp.Email.toLowerCase().includes(term) ||
          (emp.JobTitle && emp.JobTitle.toLowerCase().includes(term))
      );
    }

    if (deptFilter !== '') {
      result = result.filter(emp => emp.Department === deptFilter);
    }

    if (statusFilter !== '') {
      result = result.filter(emp => emp.Status === statusFilter);
    }

    setFilteredEmployees(result);
  }, [employees, searchTerm, deptFilter, statusFilter]);

  // Modal form submissions
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedEmployee) {
        // Edit flow
        await employeeService.updateEmployee(selectedEmployee.EmployeeId, formData);
      } else {
        // Create flow
        await employeeService.createEmployee(formData);
      }
      setIsModalOpen(false);
      setSelectedEmployee(null);
      // Reload records to refresh table and count
      await loadData();
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('Failed to save employee. Please try again.');
    }
  };

  // Trigger editing
  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Trigger deletion
  const handleDeleteClick = async (employeeId) => {
    const employee = employees.find(e => e.EmployeeId === employeeId);
    const assignedAssetsCount = assets.filter(a => a.AssignedToEmployeeId === employeeId).length;
    
    let confirmMsg = `Are you sure you want to delete ${employee?.FullName || 'this employee'}?`;
    if (assignedAssetsCount > 0) {
      confirmMsg += `\n\nWarning: This employee currently has ${assignedAssetsCount} assets assigned. Deleting them will return these assets to the available stock.`;
    }

    if (window.confirm(confirmMsg)) {
      try {
        await employeeService.deleteEmployee(employeeId);
        // Reload all data to refresh tables, counts, and asset links
        await loadData();
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee.');
      }
    }
  };

  const handleOpenAddModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Employee Directory</h1>
          <p className="page-subtitle">Manage organization personnel records, status, and department groups.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Searching & Filtering Panel */}
      <div className="card table-actions-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, title..."
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
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="IT">IT Support</option>
            <option value="HR">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Sales">Sales & Business Dev</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading directory records...</p>
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          assets={assets}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Registration/Edit Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default EmployeesPage;
