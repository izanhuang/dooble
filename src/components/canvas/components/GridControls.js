import React from "react";

const GridControls = ({ showGrid, onGridToggle, onExport }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        gap: "10px",
      }}
    >
      <button
        onClick={onGridToggle}
        style={{
          padding: "8px 16px",
          backgroundColor: showGrid ? "#f5f5f5" : "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {showGrid ? (
          <img
            src="/icons/Show.png"
            style={{ width: "24px", height: "24px" }}
            alt="Show"
          />
        ) : (
          <img
            src="/icons/hide.png"
            style={{ width: "24px", height: "24px" }}
            alt="Hide"
          />
        )}
      </button>
      <button
        onClick={onExport}
        style={{
          padding: "8px 16px",
          backgroundColor: "#f5f5f5",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        <img
          src="/icons/export.png"
          style={{ width: "24px", height: "24px" }}
          alt="Export"
        />
      </button>
    </div>
  );
};

export default GridControls;
