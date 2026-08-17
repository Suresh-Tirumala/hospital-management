import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowRight, HiOutlineCheck } from "react-icons/hi";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [selectedCred, setSelectedCred] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialClick = (user, pass, role) => {
    setForm({ username: user, password: pass });
    setSelectedCred(role);
    toast.success(`${role} credentials selected`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">M</div>
          <h1>MediCore HMS</h1>
          <p>Sign in to manage your medical services</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-icon">
              <HiOutlineUser />
              <input
                className="form-input"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon">
              <HiOutlineLockClosed />
              <input
                className="form-input"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verifying..." : (
              <>
                Sign In <HiOutlineArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          New to MediCore? <Link to="/register">Create an account</Link>
        </div>

        <div className="demo-credentials">
          <p>Quick Access Demo - Click to fill</p>
          <div className="grid">
            {[
              { role: "Admin", user: "admin", pass: "admin123" },
              { role: "Doctor", user: "dr.rajesh", pass: "doctor123" },
              { role: "Patient", user: "rahul", pass: "patient123" },
              { role: "Staff", user: "receptionist", pass: "recep123" }
            ].map((cred, i) => (
              <button
                key={i}
                type="button"
                className={`cred-item ${selectedCred === cred.role ? 'selected' : ''}`}
                onClick={() => handleCredentialClick(cred.user, cred.pass, cred.role)}
              >
                <div className="role">
                  {cred.role}
                  {selectedCred === cred.role && <HiOutlineCheck />}
                </div>
                <div className="username">{cred.user}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
