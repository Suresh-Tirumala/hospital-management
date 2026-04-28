import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import { dashboardAPI, appointmentAPI } from "../services/api";
import {
  HiOutlineUsers, HiOutlineUserGroup, HiOutlineCalendar,
  HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineXCircle, HiOutlineTrendingUp, HiOutlineDotsVertical
} from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { statsUpdateTrigger } = useRealTime();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [statsUpdateTrigger]);

  const loadDashboard = async () => {
    try {
      if (isAdmin()) {
        const res = await dashboardAPI.getAdmin();
        setStats(res.data.data);
      }
      try {
        const aptRes = await appointmentAPI.getAll(0, 5);
        setAppointments(aptRes.data.data || []);
      } catch (e) {
        // Non-admin might not have access to all appointments
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  const barData = stats ? [
    { name: "Mon", count: 40 },
    { name: "Tue", count: 30 },
    { name: "Wed", count: 60 },
    { name: "Thu", count: 45 },
    { name: "Fri", count: 70 },
    { name: "Sat", count: 20 },
    { name: "Sun", count: 10 },
  ] : [];

  const areaData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 4500 },
    { name: "May", revenue: 6000 },
    { name: "Jun", revenue: 5500 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-container">
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-1px" }}>Overview</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Monitor your hospital"s vital statistics in real-time.</p>
        </div>

        {isAdmin() && stats && (
          <>
            <div className="stats-grid">
              <StatCard 
                title="Total Patients" 
                value={stats.totalPatients} 
                icon={<HiOutlineUsers />} 
                type="primary" 
                trend={12} 
                delay="delay-1"
              />
              <StatCard 
                title="Active Doctors" 
                value={stats.activeDoctors} 
                icon={<HiOutlineUserGroup />} 
                type="info" 
                trend={5} 
                delay="delay-2"
              />
              <StatCard 
                title="Today Appointments" 
                value={stats.todayAppointments} 
                icon={<HiOutlineCalendar />} 
                type="success" 
                trend={-2} 
                delay="delay-3"
              />
              <StatCard 
                title="Monthly Revenue" 
                value={`₹${Number(stats.totalRevenue || 0).toLocaleString()}`} 
                icon={<HiOutlineCurrencyDollar />} 
                type="warning" 
                trend={8} 
                delay="delay-4"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "28px" }}>
              <div className="card animate-slide-up delay-2">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Revenue Flow</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Monthly revenue analysis</p>
                  </div>
                  <button className="btn-icon"><HiOutlineDotsVertical /></button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="var(--text-muted)" fontSize={12} dy={10} />
                    <YAxis axisLine={false} tickLine={false} stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "var(--shadow-lg)" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card animate-slide-up delay-3">
                <div className="card-header">
                  <h3 className="card-title">Weekly Activity</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip 
                      cursor={{ fill: "var(--bg-hover)" }}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "var(--shadow-lg)" }}
                    />
                    <Bar dataKey="count" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div className="card animate-slide-up delay-4">
            <div className="card-header">
              <h3 className="card-title">Recent Appointments</h3>
              <button className="btn btn-secondary btn-sm">View All</button>
            </div>
            {appointments.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="user-avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                              {apt.patientName.charAt(0)}
                            </div>
                            <span style={{ fontWeight: "600" }}>{apt.patientName}</span>
                          </div>
                        </td>
                        <td>{apt.doctorName}</td>
                        <td>{apt.appointmentDateTime}</td>
                        <td><span className={`badge ${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <HiOutlineCalendar style={{ fontSize: 48 }} />
                <h3>No appointments yet</h3>
              </div>
            )}
          </div>

          <div className="card animate-slide-up delay-4">
            <div className="card-header">
              <h3 className="card-title">System Activity</h3>
            </div>
            <div className="activity-list">
              {[
                { type: "appointment", text: "New appointment booked by John Doe", time: "2 mins ago", color: "var(--primary)" },
                { type: "bill", text: "Bill generated for Sarah Smith", time: "15 mins ago", color: "var(--success)" },
                { type: "patient", text: "New patient registered", time: "1 hour ago", color: "var(--info)" },
                { type: "record", text: "Medical record updated for Mike", time: "3 hours ago", color: "var(--warning)" },
              ].map((activity, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "2px", background: activity.color, borderRadius: "2px" }}></div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>{activity.text}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
