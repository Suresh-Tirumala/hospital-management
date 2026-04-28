import React from "react";

const StatCard = ({ title, value, icon, type = "primary", trend, delay = "" }) => {
  return (
    <div className={`stat-card ${type} animate-slide-up ${delay}`}>
      <div className={`stat-icon ${type}`}>{icon}</div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
        {trend && (
          <div className={`trend ${trend > 0 ? "up" : "down"}`} style={{ 
            fontSize: "12px", 
            fontWeight: "600", 
            marginTop: "8px",
            color: trend > 0 ? "var(--success)" : "var(--danger)",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <span>{trend > 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;