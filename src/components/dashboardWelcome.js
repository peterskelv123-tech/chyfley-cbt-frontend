import React from "react";
import { FaBell } from "react-icons/fa";

const DashboardHeader = () => {
  return (
    <div className="dashboard-header d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
      {/* Left side */}
      <div className="d-flex align-items-center">
        <h6 className="mb-0 me-3 fw-bold">Admin's Dashboard</h6>
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          style={{ width: "250px" }}
        />
      </div>

      {/* Right side */}
      <div className="d-flex align-items-center">
        <FaBell size={18} className="me-4 text-dark" />
        <div className="d-flex align-items-center">
          <img
            src="/img/Avatart1.jpg" // <-- replace with your profile image path
            alt="User"
            className="rounded-circle me-2"
            style={{ width: "35px", height: "35px", objectFit: "cover" }}
          />
          <div>
            <strong className="d-block" style={{ fontSize: "14px" }}>
              Name: Kelvin
            </strong>
            <small className="text-muted" style={{ fontSize: "12px" }}>
              Class: ss1d
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
