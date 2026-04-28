import { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineX, HiOutlineCalendar } from 'react-icons/hi';

const Appointments = () => {
  const { user, isAdmin, isReceptionist, isDoctor, isPatient } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState({ number: 0, totalPages: 0 });
  const [form, setForm] = useState({
    patientId: '', doctorId: '', appointmentDateTime: '', type: 'CONSULTATION', reason: '', notes: ''
  });

  useEffect(() => { loadAppointments(); loadDoctorsAndPatients(); }, []);

  const loadAppointments = async (p = 0) => {
    setLoading(true);
    try {
      let res;
      if (filter !== 'ALL') {
        res = await appointmentAPI.getByStatus(filter, p);
      } else {
        res = await appointmentAPI.getAll(p);
      }
      setAppointments(res.data.data || []);
      if (res.data.page) setPage(res.data.page);
    } catch (err) {
      // might not have access
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorsAndPatients = async () => {
    try {
      const docRes = await doctorAPI.getAll(0, 100);
      setDoctors(docRes.data.data || []);
    } catch (e) {}
    try {
      const patRes = await patientAPI.getAll(0, 100);
      setPatients(patRes.data.data || []);
    } catch (e) {}
  };

  const handleFilterChange = (f) => { setFilter(f); setTimeout(() => loadAppointments(0), 0); };

  useEffect(() => { loadAppointments(0); }, [filter]);

  const openCreate = () => {
    setForm({ patientId: '', doctorId: '', appointmentDateTime: '', type: 'CONSULTATION', reason: '', notes: '' });
    setShowModal(true);
  };

  const openStatusUpdate = (apt) => {
    setSelectedApt(apt);
    setStatusForm({ status: apt.status, notes: '' });
    setShowStatusModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.create(form);
      toast.success('Appointment booked!');
      setShowModal(false);
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.updateStatus(selectedApt.id, statusForm);
      toast.success('Status updated');
      setShowStatusModal(false);
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const canManage = isAdmin() || isReceptionist() || isDoctor();

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">Appointments</h1>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Book Appointment</button>
      </div>

      <div className="page-container">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="filter-tabs">
              {['ALL', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
                <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => handleFilterChange(f)}>{f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : appointments.length > 0 ? (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{apt.appointmentId}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{apt.patientName}</td>
                      <td>{apt.doctorName}</td>
                      <td>{apt.appointmentDateTime}</td>
                      <td><span className="badge info">{apt.type}</span></td>
                      <td><span className={`badge ${apt.status?.toLowerCase()}`}>{apt.status}</span></td>
                      <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.reason || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {canManage && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => openStatusUpdate(apt)}>Update</button>
                          )}
                          {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt.id)}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {page.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page.number === 0} onClick={() => loadAppointments(page.number - 1)}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page.number + 1} of {page.totalPages}</span>
                <button disabled={page.number >= page.totalPages - 1} onClick={() => loadAppointments(page.number + 1)}>Next</button>
              </div>
            )}
          </div>
        ) : (
          <div className="card"><div className="empty-state"><HiOutlineCalendar /><h3>No appointments found</h3><p>Book an appointment to get started</p></div></div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book Appointment</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Patient *</label>
                  <select className="form-select" value={form.patientId} onChange={set('patientId')} required>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Doctor *</label>
                  <select className="form-select" value={form.doctorId} onChange={set('doctorId')} required>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input className="form-input" type="datetime-local" value={form.appointmentDateTime} onChange={set('appointmentDateTime')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={set('type')}>
                    <option value="CONSULTATION">Consultation</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="ROUTINE_CHECK">Routine Check</option>
                    <option value="PROCEDURE">Procedure</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea className="form-textarea" value={form.reason} onChange={set('reason')} placeholder="Reason for visit..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Appointment Status</h3>
              <button className="btn-icon" onClick={() => setShowStatusModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleStatusUpdate}>
              <div className="modal-body">
                <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
                  Appointment: <strong style={{ color: 'var(--primary-light)' }}>{selectedApt?.appointmentId}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select className="form-select" value={statusForm.status} onChange={e => setStatusForm({ ...statusForm, status: e.target.value })} required>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={statusForm.notes} onChange={e => setStatusForm({ ...statusForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Appointments;
