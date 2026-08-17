import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineClock, HiOutlineChartBar, HiOutlineUserGroup, HiOutlineHeart } from 'react-icons/hi';
import { MdHealthAndSafety } from 'react-icons/md';

const Hero = () => {
  const features = [
    { icon: <HiOutlineUserGroup />, title: 'Role-Based Access', desc: 'Admin, Doctor, Receptionist & Patient dashboards' },
    { icon: <HiOutlineClock />, title: 'Smart Scheduling', desc: 'Book appointments and manage doctor availability' },
    { icon: <HiOutlineChartBar />, title: 'Analytics Dashboard', desc: 'Real-time hospital stats and revenue tracking' },
    { icon: <HiOutlineHeart />, title: 'AI Assistant', desc: 'Medical education and rehabilitation guidance' },
    { icon: <HiOutlineShieldCheck />, title: 'Secure & Private', desc: 'JWT authentication and role-based permissions' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <MdHealthAndSafety />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>MediCore</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ padding: '10px 24px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Sign In</Link>
          <Link to="/register" style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Get Started</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 48px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
          Hospital Management Platform
        </div>

        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Modern Healthcare<br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Management System</span>
        </h1>

        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Streamline patient care, appointments, billing, and medical records — all in one secure platform with AI-powered assistance.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 80 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'all 0.3s' }}>
            Get Started <HiOutlineArrowRight size={18} />
          </Link>
        </div>

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto 80px', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ marginLeft: 12, fontSize: 12, color: '#64748b' }}>MediCore Dashboard</span>
          </div>
          <div style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', padding: '40px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Patients', value: '2,847', color: '#818cf8' },
              { label: 'Doctors', value: '124', color: '#38bdf8' },
              { label: 'Appointments', value: '89', color: '#10b981' },
              { label: 'Revenue', value: '₹12.4L', color: '#f97316' },
            ].map((stat, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px 20px', textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ fontSize: 28, color: '#818cf8', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 48px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        MediCore HMS &copy; {new Date().getFullYear()} &mdash; Educational &amp; Demonstration Purposes
      </footer>
    </div>
  );
};

export default Hero;
