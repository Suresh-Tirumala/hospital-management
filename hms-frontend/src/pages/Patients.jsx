import { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineX, HiOutlineUsers } from 'react-icons/hi';

const Patients = () => {
  const { isAdmin, isReceptionist } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState({ number: 0, totalPages: 0 });
  const [form, setForm] = useState({
    name: '', dateOfBirth: '', gender: 'MALE', phone: '', email: '', address: '',
    bloodGroup: '', allergies: '', chronicConditions: '', emergencyContact: '',
    insuranceProvider: '', insurancePolicyNumber: ''
  });

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async (p = 0) => {
    setLoading(true);
    try {
      const res = search ? await patientAPI.search(search, p) : await patientAPI.getAll(p);
      setPatients(res.data.data || []);
      if (res.data.page) setPage(res.data.page);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); loadPatients(0); };

  const openCreate = () => {
    setSelectedPatient(null);
    setForm({ name: '', dateOfBirth: '', gender: 'MALE', phone: '', email: '', address: '', bloodGroup: '', allergies: '', chronicConditions: '', emergencyContact: '', insuranceProvider: '', insurancePolicyNumber: '' });
    setShowModal(true);
  };

  const openEdit = (pat) => {
    setSelectedPatient(pat);
    setForm({
      name: pat.name || '', dateOfBirth: pat.dateOfBirth || '', gender: pat.gender || 'MALE',
      phone: pat.phone || '', email: pat.email || '', address: pat.address || '',
      bloodGroup: pat.bloodGroup || '', allergies: pat.allergies || '',
      chronicConditions: pat.chronicConditions || '', emergencyContact: pat.emergencyContact || '',
      insuranceProvider: pat.insuranceProvider || '', insurancePolicyNumber: pat.insurancePolicyNumber || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPatient) {
        await patientAPI.update(selectedPatient.id, form);
        toast.success('Patient updated');
      } else {
        await patientAPI.create(form);
        toast.success('Patient registered');
      }
      setShowModal(false);
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">Patients</h1>
        {(isAdmin() || isReceptionist()) && (
          <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Register Patient</button>
        )}
      </div>

      <div className="page-container">
        <div className="toolbar">
          <form className="toolbar-left" onSubmit={handleSearch}>
            <div className="search-bar" style={{ maxWidth: 360 }}>
              <HiOutlineSearch />
              <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : patients.length > 0 ? (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Blood Group</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(pat => (
                    <tr key={pat.id}>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{pat.patientId}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{pat.name}</td>
                      <td>{pat.dateOfBirth}</td>
                      <td>{pat.gender}</td>
                      <td>{pat.phone}</td>
                      <td><span className="badge primary">{pat.bloodGroup || 'N/A'}</span></td>
                      <td><span className={`badge ${pat.status?.toLowerCase()}`}>{pat.status}</span></td>
                      <td>
                        {(isAdmin() || isReceptionist()) && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(pat)}>Edit</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {page.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page.number === 0} onClick={() => loadPatients(page.number - 1)}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page.number + 1} of {page.totalPages}</span>
                <button disabled={page.number >= page.totalPages - 1} onClick={() => loadPatients(page.number + 1)}>Next</button>
              </div>
            )}
          </div>
        ) : (
          <div className="card"><div className="empty-state"><HiOutlineUsers /><h3>No patients found</h3><p>Register patients to get started</p></div></div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedPatient ? 'Edit Patient' : 'Register Patient'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth *</label>
                    <input className="form-input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select className="form-select" value={form.gender} onChange={set('gender')}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={set('phone')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={set('email')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-select" value={form.bloodGroup} onChange={set('bloodGroup')}>
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" value={form.address} onChange={set('address')} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Allergies</label>
                    <input className="form-input" value={form.allergies} onChange={set('allergies')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chronic Conditions</label>
                    <input className="form-input" value={form.chronicConditions} onChange={set('chronicConditions')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input className="form-input" value={form.emergencyContact} onChange={set('emergencyContact')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Insurance Provider</label>
                    <input className="form-input" value={form.insuranceProvider} onChange={set('insuranceProvider')} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{selectedPatient ? 'Update' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Patients;
