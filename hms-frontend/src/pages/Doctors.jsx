import { useState, useEffect, useCallback } from 'react';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineX, HiOutlineUserGroup } from 'react-icons/hi';

const Doctors = () => {
  const { isAdmin, isReceptionist } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [page, setPage] = useState({ number: 0, totalPages: 0 });
  const [form, setForm] = useState({
    name: '', specialization: '', department: '', qualification: '',
    experienceYears: '', phone: '', email: '', consultationFee: '',
    availableFrom: '09:00', availableTo: '17:00', availableDays: 'MON,TUE,WED,THU,FRI', bio: ''
  });

  const loadDoctors = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = search
        ? await doctorAPI.search(search, p)
        : await doctorAPI.getAll(p);
      setDoctors(res.data.data || []);
      if (res.data.page) setPage(res.data.page);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    loadDoctors(0);
  }, [loadDoctors]);

  const openCreate = useCallback(() => {
    setSelectedDoctor(null);
    setForm({ name: '', specialization: '', department: '', qualification: '', experienceYears: '', phone: '', email: '', consultationFee: '', availableFrom: '09:00', availableTo: '17:00', availableDays: 'MON,TUE,WED,THU,FRI', bio: '' });
    setShowModal(true);
  }, []);

  const openEdit = useCallback((doc) => {
    setSelectedDoctor(doc);
    setForm({
      name: doc.name || '', specialization: doc.specialization || '', department: doc.department || '',
      qualification: doc.qualification || '', experienceYears: doc.experienceYears || '',
      phone: doc.phone || '', email: doc.email || '', consultationFee: doc.consultationFee || '',
      availableFrom: doc.availableFrom || '09:00', availableTo: doc.availableTo || '17:00',
      availableDays: doc.availableDays || '', bio: doc.bio || ''
    });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (selectedDoctor) {
        await doctorAPI.update(selectedDoctor.id, form);
        toast.success('Doctor updated');
      } else {
        await doctorAPI.create(form);
        toast.success('Doctor created');
      }
      setShowModal(false);
      loadDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  }, [selectedDoctor, form, loadDoctors]);

  const set = useCallback((f) => (e) => setForm({ ...form, [f]: e.target.value }), [form]);

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">Doctors</h1>
        {(isAdmin() || isReceptionist()) && (
          <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Add Doctor</button>
        )}
      </div>

      <div className="page-container">
        <div className="toolbar">
          <form className="toolbar-left" onSubmit={handleSearch}>
            <div className="search-bar" style={{ maxWidth: 360 }}>
              <HiOutlineSearch />
              <input placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : doctors.length > 0 ? (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Doctor ID</th>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{doc.doctorId}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{doc.name}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.department}</td>
                      <td>{doc.experienceYears} yrs</td>
                      <td>₹{doc.consultationFee}</td>
                      <td style={{ fontSize: 12 }}>{doc.availableFrom} - {doc.availableTo}</td>
                      <td><span className={`badge ${doc.status?.toLowerCase()}`}>{doc.status}</span></td>
                      <td>
                        {(isAdmin() || isReceptionist()) && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(doc)}>Edit</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {page.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page.number === 0} onClick={() => loadDoctors(page.number - 1)}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page.number + 1} of {page.totalPages}</span>
                <button disabled={page.number >= page.totalPages - 1} onClick={() => loadDoctors(page.number + 1)}>Next</button>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <HiOutlineUserGroup />
              <h3>No doctors found</h3>
              <p>Add doctors to get started</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDoctor ? 'Edit Doctor' : 'Add Doctor'}</h3>
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
                    <label className="form-label">Specialization *</label>
                    <input className="form-input" value={form.specialization} onChange={set('specialization')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" value={form.department} onChange={set('department')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input className="form-input" value={form.qualification} onChange={set('qualification')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input className="form-input" type="number" value={form.experienceYears} onChange={set('experienceYears')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (₹)</label>
                    <input className="form-input" type="number" value={form.consultationFee} onChange={set('consultationFee')} />
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
                    <label className="form-label">Available From</label>
                    <input className="form-input" type="time" value={form.availableFrom} onChange={set('availableFrom')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available To</label>
                    <input className="form-input" type="time" value={form.availableTo} onChange={set('availableTo')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Available Days</label>
                  <input className="form-input" value={form.availableDays} onChange={set('availableDays')} placeholder="MON,TUE,WED,THU,FRI" />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" value={form.bio} onChange={set('bio')} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{selectedDoctor ? 'Update' : 'Create'} Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Doctors;
