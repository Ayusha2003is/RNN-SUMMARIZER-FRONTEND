import React from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { GiNotebook } from "react-icons/gi";

export default function UploadSection() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Upload Your Files</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "50px",
          marginTop: "30px",
        }}
      >
        {/* File Icon */}
        <div style={{ textAlign: "center" }}>
          <FaRegFileAlt style={{ fontSize: "60px", color: "#4CAF50" }} />
          <p>Upload Document</p>
        </div>

        {/* Notebook Icon */}
        <div style={{ textAlign: "center" }}>
          <GiNotebook style={{ fontSize: "60px", color: "#2196F3" }} />
          <p>Upload Notebook</p>
        </div>
      </div>

      {/* Upload Button */}
      <button
        style={{
          marginTop: "40px",
          padding: "12px 30px",
          fontSize: "16px",
          backgroundColor: "#FF5722",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Choose File
      </button>
    </div>
  );
}
