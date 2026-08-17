import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { MdHealthAndSafety } from 'react-icons/md';

const Hero = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <MdHealthAndSafety />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>MediCore</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ padding: '10px 24px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          <Link to="/register" style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px' }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
            Hospital Management Platform
          </div>

          <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
            Modern Healthcare<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Management System</span>
          </h1>

          <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Streamline patient care, appointments, billing, and medical records — all in one secure platform.
          </p>

          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
            Get Started <HiOutlineArrowRight size={18} />
          </Link>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 48px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        MediCore HMS &copy; {new Date().getFullYear()} &mdash; Educational &amp; Demonstration Purposes
      </footer>
    </div>
  );
};

export default Hero;
