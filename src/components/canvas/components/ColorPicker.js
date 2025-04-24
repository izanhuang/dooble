import React from "react";

const ColorPicker = ({ color, onColorChange, colorUsed }) => {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <input
        type="color"
        value={color}
        onChange={onColorChange}
        style={{
          width: "40px",
          height: "40px",
          padding: 0,
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "24px",
          height: "24px",
          backgroundColor: color,
          borderRadius: "4px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "8px",
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          width: "200px",
          padding: "8px",
          backgroundColor: "#fff",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {colorUsed.map((usedColor, index) => (
          <div
            key={index}
            onClick={() => onColorChange({ target: { value: usedColor } })}
            style={{
              width: "24px",
              height: "24px",
              backgroundColor: usedColor,
              borderRadius: "4px",
              cursor: "pointer",
              border: color === usedColor ? "2px solid #2196F3" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
