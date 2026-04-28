import { useState, useEffect } from 'react';
import { billAPI, appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineCurrencyDollar, HiOutlineEye } from 'react-icons/hi';

const Bills = () => {
  const { isAdmin, isReceptionist } = useAuth();
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState({ number: 0, totalPages: 0 });
  const [form, setForm] = useState({
    appointmentId: '', consultationCharge: '', treatmentCharge: '', medicationCharge: '',
    labTestCharge: '', otherCharges: '', discount: '', tax: '', notes: ''
  });
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'CASH', referenceNumber: '', notes: '' });

  useEffect(() => { loadBills(); loadAppointments(); }, []);
  useEffect(() => { loadBills(0); }, [filter]);

  const loadBills = async (p = 0) => {
    setLoading(true);
    try {
      let res;
      if (filter !== 'ALL') {
        res = await billAPI.getByStatus(filter, p);
      } else {
        res = await billAPI.getAll(p);
      }
      setBills(res.data.data || []);
      if (res.data.page) setPage(res.data.page);
    } catch (err) {
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await appointmentAPI.getAll(0, 100);
      setAppointments(res.data.data || []);
    } catch (e) {}
  };

  const openCreate = () => {
    setForm({ appointmentId: '', consultationCharge: '', treatmentCharge: '', medicationCharge: '', labTestCharge: '', otherCharges: '', discount: '', tax: '', notes: '' });
    setShowCreate(true);
  };

  const openPayment = (bill) => {
    setSelectedBill(bill);
    const remaining = (parseFloat(bill.totalAmount) - parseFloat(bill.paidAmount)).toFixed(2);
    setPayForm({ amount: remaining, paymentMethod: 'CASH', referenceNumber: '', notes: '' });
    setShowPayment(true);
  };

  const viewBill = async (id) => {
    try {
      const res = await billAPI.getById(id);
      setSelectedBill(res.data.data);
      setShowDetail(true);
    } catch (err) {
      toast.error('Failed to load bill details');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await billAPI.create(form);
      toast.success('Bill generated!');
      setShowCreate(false);
      loadBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await billAPI.addPayment(selectedBill.id, payForm);
      toast.success('Payment recorded!');
      setShowPayment(false);
      loadBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const canManage = isAdmin() || isReceptionist();

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">Billing & Payments</h1>
        {canManage && (
          <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Generate Bill</button>
        )}
      </div>

      <div className="page-container">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="filter-tabs">
              {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map(f => (
                <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}>{f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : bills.length > 0 ? (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Patient</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => (
                    <tr key={bill.id}>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{bill.billNumber}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{bill.patientName}</td>
                      <td style={{ fontWeight: 600 }}>₹{parseFloat(bill.totalAmount).toLocaleString()}</td>
                      <td style={{ color: 'var(--success)' }}>₹{parseFloat(bill.paidAmount).toLocaleString()}</td>
                      <td style={{ color: 'var(--warning)' }}>₹{(parseFloat(bill.totalAmount) - parseFloat(bill.paidAmount)).toLocaleString()}</td>
                      <td><span className={`badge ${bill.paymentStatus?.toLowerCase()}`}>{bill.paymentStatus}</span></td>
                      <td style={{ fontSize: 13 }}>{bill.createdAt?.split('T')[0]}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => viewBill(bill.id)}><HiOutlineEye /></button>
                          {canManage && bill.paymentStatus !== 'PAID' && (
                            <button className="btn btn-success btn-sm" onClick={() => openPayment(bill)}>Pay</button>
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
                <button disabled={page.number === 0} onClick={() => loadBills(page.number - 1)}>Previous</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page.number + 1} of {page.totalPages}</span>
                <button disabled={page.number >= page.totalPages - 1} onClick={() => loadBills(page.number + 1)}>Next</button>
              </div>
            )}
          </div>
        ) : (
          <div className="card"><div className="empty-state"><HiOutlineCurrencyDollar /><h3>No bills found</h3><p>Bills will appear here after generation</p></div></div>
        )}
      </div>

      {/* Create Bill Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate Bill</h3>
              <button className="btn-icon" onClick={() => setShowCreate(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Appointment *</label>
                  <select className="form-select" value={form.appointmentId} onChange={set('appointmentId')} required>
                    <option value="">Select Appointment</option>
                    {appointments.map(a => (
                      <option key={a.id} value={a.id}>{a.appointmentId} — {a.patientName} ({a.appointmentDateTime})</option>
                    ))}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Consultation Charge (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.consultationCharge} onChange={set('consultationCharge')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Treatment Charge (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.treatmentCharge} onChange={set('treatmentCharge')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medication Charge (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.medicationCharge} onChange={set('medicationCharge')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lab Test Charge (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.labTestCharge} onChange={set('labTestCharge')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Other Charges (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.otherCharges} onChange={set('otherCharges')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.discount} onChange={set('discount')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.tax} onChange={set('tax')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={set('notes')} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="btn-icon" onClick={() => setShowPayment(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
                  Bill: <strong style={{ color: 'var(--primary-light)' }}>{selectedBill?.billNumber}</strong>
                  &nbsp;• Balance: <strong style={{ color: 'var(--warning)' }}>₹{(parseFloat(selectedBill?.totalAmount) - parseFloat(selectedBill?.paidAmount)).toFixed(2)}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-input" type="number" step="0.01" value={payForm.amount}
                    onChange={e => setPayForm({ ...payForm, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select className="form-select" value={payForm.paymentMethod}
                    onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reference Number</label>
                  <input className="form-input" value={payForm.referenceNumber}
                    onChange={e => setPayForm({ ...payForm, referenceNumber: e.target.value })} placeholder="Transaction ID, card last 4, etc." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayment(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Detail Modal */}
      {showDetail && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bill Details — {selectedBill.billNumber}</h3>
              <button className="btn-icon" onClick={() => setShowDetail(false)}><HiOutlineX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Patient</label><span>{selectedBill.patientName}</span></div>
                <div className="detail-item"><label>Status</label><span className={`badge ${selectedBill.paymentStatus?.toLowerCase()}`}>{selectedBill.paymentStatus}</span></div>
              </div>
              <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Charges Breakdown</h4>
                <div className="detail-grid">
                  <div className="detail-item"><label>Consultation</label><span>₹{selectedBill.consultationCharge}</span></div>
                  <div className="detail-item"><label>Treatment</label><span>₹{selectedBill.treatmentCharge}</span></div>
                  <div className="detail-item"><label>Medication</label><span>₹{selectedBill.medicationCharge}</span></div>
                  <div className="detail-item"><label>Lab Tests</label><span>₹{selectedBill.labTestCharge}</span></div>
                  <div className="detail-item"><label>Other</label><span>₹{selectedBill.otherCharges}</span></div>
                  <div className="detail-item"><label>Tax</label><span>₹{selectedBill.tax}</span></div>
                  <div className="detail-item"><label>Discount</label><span style={{ color: 'var(--success)' }}>-₹{selectedBill.discount}</span></div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <div><strong style={{ fontSize: 16 }}>Total: ₹{parseFloat(selectedBill.totalAmount).toLocaleString()}</strong></div>
                  <div><strong style={{ color: 'var(--success)', fontSize: 16 }}>Paid: ₹{parseFloat(selectedBill.paidAmount).toLocaleString()}</strong></div>
                </div>
              </div>

              {selectedBill.payments && selectedBill.payments.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ marginBottom: 12, color: 'var(--primary-light)' }}>Payment History</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>Txn ID</th><th>Amount</th><th>Method</th><th>Date</th><th>Received By</th></tr>
                      </thead>
                      <tbody>
                        {selectedBill.payments.map(p => (
                          <tr key={p.id}>
                            <td>{p.transactionId}</td>
                            <td>₹{parseFloat(p.amount).toLocaleString()}</td>
                            <td>{p.paymentMethod}</td>
                            <td>{p.paymentDate}</td>
                            <td>{p.receivedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Bills;
