import React from "react";

const IconButton = ({ isSelected, iconSrc, iconAlt, onClick, isDisabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: "8px",
        backgroundColor: isSelected ? "#2196F3" : "#f5f5f5",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <img
        src={iconSrc}
        style={{ width: "24px", height: "24px" }}
        alt={iconAlt}
      />
    </button>
  );
};

export default IconButton;
