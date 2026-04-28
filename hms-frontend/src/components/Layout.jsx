import { useState, useMemo } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineViewGrid, HiOutlineUserGroup, HiOutlineCalendar,
  HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineCog,
  HiOutlineLogout, HiOutlineUsers, HiOutlineClipboardList,
  HiOutlineMenuAlt2, HiOutlineChevronLeft, HiOutlineBell, HiOutlineSearch
} from "react-icons/hi";

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdminUser = useMemo(() => isAdmin(), [user]);

  const navItems = useMemo(() => [
    { label: "Dashboard", path: "/dashboard", icon: <HiOutlineViewGrid />, show: true },
    { label: "Doctors", path: "/doctors", icon: <HiOutlineUserGroup />, show: true },
    { label: "Patients", path: "/patients", icon: <HiOutlineUsers />, show: isAdminUser },
    { label: "Appointments", path: "/appointments", icon: <HiOutlineCalendar />, show: true },
    { label: "Medical Records", path: "/medical-records", icon: <HiOutlineClipboardList />, show: true },
    { label: "Billing", path: "/bills", icon: <HiOutlineCurrencyDollar />, show: true },
    { label: "User Management", path: "/users", icon: <HiOutlineCog />, show: isAdminUser },
  ], [isAdminUser]);

  const initials = useMemo(() => user?.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U", [user?.fullName]);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">H</div>
          {!collapsed && (
            <div>
              <h2>MediCore</h2>
              <span>Hospital Management</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-title">Main Menu</div>}
          {navItems.filter(item => item.show).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : ""}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            {!collapsed && (
              <div className="user-info">
                <div className="name">{user?.fullName}</div>
                <div className="role">{user?.role?.toLowerCase()}</div>
              </div>
            )}
            {!collapsed && (
              <button className="btn-icon" onClick={handleLogout} title="Logout">
                <HiOutlineLogout />
              </button>
            )}
          </div>
          <button 
            className="btn-icon toggle-sidebar" 
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: "100%", marginTop: "10px", border: "none" }}
          >
            {collapsed ? <HiOutlineMenuAlt2 /> : <HiOutlineChevronLeft />}
          </button>
        </div>
      </aside>

      <main className={`main-content ${collapsed ? "expanded" : ""}`}>
        <header className="top-header">
          <div className="header-search">
            <div className="search-bar" style={{ width: "300px" }}>
              <HiOutlineSearch />
              <input type="text" placeholder="Search everything..." />
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-icon"><HiOutlineBell /></button>
            <div className="v-divider" style={{ width: "1px", height: "24px", background: "var(--border)", margin: "0 10px" }}></div>
            <div className="user-profile-summary" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
               <div className="user-info" style={{ textAlign: "right" }}>
                  <div className="name" style={{ fontSize: "14px", fontWeight: "700" }}>{user?.fullName}</div>
                  <div className="role" style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>{user?.role?.toLowerCase()}</div>
               </div>
               <div className="user-avatar" style={{ width: "40px", height: "40px" }}>{initials}</div>
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
