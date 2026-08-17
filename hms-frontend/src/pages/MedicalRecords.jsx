import { useState, useEffect } from 'react';
import { medicalRecordAPI, appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineClipboardList, HiOutlineEye } from 'react-icons/hi';

const MedicalRecords = () => {
  const { isDoctor, isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [page, setPage] = useState({ number: 0, totalPages: 0 });
  const [form, setForm] = useState({
    appointmentId: '', chiefComplaint: '', diagnosis: '', symptoms: '', examFindings: '',
    labResults: '', treatment: '', doctorNotes: '', followUpInstructions: '', nextFollowUpDate: '',
    prescriptions: [{ medicineName: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' }]
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try to load completed appointments for creating records
      try {
        const aptRes = await appointmentAPI.getByStatus('COMPLETED', 0);
        setAppointments(aptRes.data.data || []);
      } catch (e) {
        try {
          const aptRes = await appointmentAPI.getAll(0, 50);
          setAppointments((aptRes.data.data || []).filter(a => a.status === 'COMPLETED'));
        } catch (e2) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      appointmentId: '', chiefComplaint: '', diagnosis: '', symptoms: '', examFindings: '',
      labResults: '', treatment: '', doctorNotes: '', followUpInstructions: '', nextFollowUpDate: '',
      prescriptions: [{ medicineName: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' }]
    });
    setShowModal(true);
  };

  const viewRecord = async (appointmentId) => {
    try {
      const res = await medicalRecordAPI.getByAppointment(appointmentId);
      setSelectedRecord(res.data.data);
      setShowDetail(true);
    } catch (err) {
      toast.error('No medical record found for this appointment');
    }
  };

  const addPrescription = () => {
    setForm({
      ...form,
      prescriptions: [...form.prescriptions, { medicineName: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' }]
    });
  };

  const removePrescription = (index) => {
    setForm({ ...form, prescriptions: form.prescriptions.filter((_, i) => i !== index) });
  };

  const updatePrescription = (index, field, value) => {
    const updated = [...form.prescriptions];
    updated[index][field] = value;
    setForm({ ...form, prescriptions: updated });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        prescriptions: form.prescriptions.filter(p => p.medicineName.trim() !== '')
      };
      await medicalRecordAPI.create(payload);
      toast.success('Medical record created!');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record');
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">Medical Records</h1>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Create Record</button>
      </div>

      <div className="page-container">
        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Completed Appointments</h3>
            </div>
            {appointments.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Appointment ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.id}>
                        <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{apt.appointmentId}</td>
                        <td>{apt.patientName}</td>
                        <td>{apt.doctorName}</td>
                        <td>{apt.appointmentDateTime}</td>
                        <td><span className="badge info">{apt.type}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => viewRecord(apt.id)}>
                            <HiOutlineEye /> View Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <HiOutlineClipboardList />
                <h3>No completed appointments</h3>
                <p>Medical records can be created after appointments are completed</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Record Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Medical Record</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Appointment *</label>
                  <select className="form-select" value={form.appointmentId} onChange={set('appointmentId')} required>
                    <option value="">Select completed appointment</option>
                    {appointments.map(a => (
                      <option key={a.id} value={a.id}>{a.appointmentId} — {a.patientName} ({a.appointmentDateTime})</option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Chief Complaint</label>
                    <textarea className="form-textarea" value={form.chiefComplaint} onChange={set('chiefComplaint')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Symptoms</label>
                    <textarea className="form-textarea" value={form.symptoms} onChange={set('symptoms')} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Diagnosis</label>
                  <textarea className="form-textarea" value={form.diagnosis} onChange={set('diagnosis')} />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Examination Findings</label>
                    <textarea className="form-textarea" value={form.examFindings} onChange={set('examFindings')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lab Results</label>
                    <textarea className="form-textarea" value={form.labResults} onChange={set('labResults')} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Treatment</label>
                  <textarea className="form-textarea" value={form.treatment} onChange={set('treatment')} />
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor Notes</label>
                  <textarea className="form-textarea" value={form.doctorNotes} onChange={set('doctorNotes')} />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Follow-up Instructions</label>
                    <input className="form-input" value={form.followUpInstructions} onChange={set('followUpInstructions')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Follow-up Date</label>
                    <input className="form-input" type="date" value={form.nextFollowUpDate} onChange={set('nextFollowUpDate')} />
                  </div>
                </div>

                {/* Prescriptions */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label className="form-label" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Prescriptions</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addPrescription}>+ Add Medicine</button>
                  </div>

                  {form.prescriptions.map((rx, idx) => (
                    <div key={idx} className="prescription-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h4>Medicine #{idx + 1}</h4>
                        {form.prescriptions.length > 1 && (
                          <button type="button" className="btn-icon" onClick={() => removePrescription(idx)} style={{ color: 'var(--danger)' }}><HiOutlineX /></button>
                        )}
                      </div>
                      <div className="form-grid">
                        <input className="form-input" placeholder="Medicine name" value={rx.medicineName}
                          onChange={e => updatePrescription(idx, 'medicineName', e.target.value)} />
                        <input className="form-input" placeholder="Dosage (e.g. 500mg)" value={rx.dosage}
                          onChange={e => updatePrescription(idx, 'dosage', e.target.value)} />
                        <input className="form-input" placeholder="Frequency (e.g. Twice daily)" value={rx.frequency}
                          onChange={e => updatePrescription(idx, 'frequency', e.target.value)} />
                        <input className="form-input" placeholder="Duration (e.g. 7 days)" value={rx.duration}
                          onChange={e => updatePrescription(idx, 'duration', e.target.value)} />
                      </div>
                      <input className="form-input" style={{ marginTop: 8 }} placeholder="Instructions (e.g. Take after meals)" value={rx.instructions}
                        onChange={e => updatePrescription(idx, 'instructions', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Detail */}
      {showDetail && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Medical Record — {selectedRecord.recordId}</h3>
              <button className="btn-icon" onClick={() => setShowDetail(false)}><HiOutlineX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Patient</label><span>{selectedRecord.patientName}</span></div>
                <div className="detail-item"><label>Doctor</label><span>{selectedRecord.doctorName}</span></div>
                <div className="detail-item"><label>Appointment Date</label><span>{selectedRecord.appointmentDate}</span></div>
                <div className="detail-item"><label>Chief Complaint</label><span>{selectedRecord.chiefComplaint || '—'}</span></div>
                <div className="detail-item"><label>Symptoms</label><span>{selectedRecord.symptoms || '—'}</span></div>
                <div className="detail-item"><label>Diagnosis</label><span style={{ color: 'var(--warning)' }}>{selectedRecord.diagnosis || '—'}</span></div>
              </div>
              <div className="detail-grid" style={{ marginTop: 12 }}>
                <div className="detail-item"><label>Treatment</label><span>{selectedRecord.treatment || '—'}</span></div>
                <div className="detail-item"><label>Exam Findings</label><span>{selectedRecord.examFindings || '—'}</span></div>
                <div className="detail-item"><label>Lab Results</label><span>{selectedRecord.labResults || '—'}</span></div>
                <div className="detail-item"><label>Doctor Notes</label><span>{selectedRecord.doctorNotes || '—'}</span></div>
                <div className="detail-item"><label>Follow-up</label><span>{selectedRecord.followUpInstructions || '—'}</span></div>
                <div className="detail-item"><label>Next Visit</label><span>{selectedRecord.nextFollowUpDate || '—'}</span></div>
              </div>

              {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ marginBottom: 12, color: 'var(--primary-light)' }}>Prescriptions</h4>
                  <ul className="prescription-list">
                    {selectedRecord.prescriptions.map((rx, i) => (
                      <li key={i} className="prescription-item">
                        <h4>{rx.medicineName}</h4>
                        <p>{rx.dosage} • {rx.frequency} • {rx.duration} {rx.route && `• ${rx.route}`}</p>
                        {rx.instructions && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{rx.instructions}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalRecords;
