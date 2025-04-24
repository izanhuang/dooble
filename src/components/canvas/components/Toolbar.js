import React, { useState } from "react";
import ColorPicker from "../ColorPicker";

const Toolbar = ({
  isSelectMode,
  isEraser,
  brushWidth,
  brushType,
  brushColor,
  colorUsed,
  canUndo,
  canRedo,
  onSelectModeToggle,
  onEraserToggle,
  onBrushWidthChange,
  onBrushTypeChange,
  onColorChange,
  onUndo,
  onRedo,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        maxWidth: "100%",
        transition: "all 0.3s ease",
        transform: isMinimized ? "translateX(-20%)" : "translateX(0)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={toggleMinimize}
          style={{
            padding: "4px 8px",
            backgroundColor: "#f5f5f5",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
        >
          {isMinimized ? "+" : "-"}
        </button>
      </div>

      <div
        style={{
          display: isMinimized ? "none" : "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          flex: "1",
        }}
      >
        <button
          onClick={onSelectModeToggle}
          style={{
            padding: "8px 16px",
            backgroundColor: isSelectMode ? "#2196F3" : "#f5f5f5",
            color: isSelectMode ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isSelectMode ? "Exit Select" : "Select"}
        </button>

        <button
          onClick={onEraserToggle}
          disabled={isSelectMode}
          style={{
            padding: "8px",
            backgroundColor: isEraser ? "#2196F3" : "#f5f5f5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isSelectMode ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            opacity: isSelectMode ? 0.5 : 1,
          }}
        >
          <img
            src="/icons/eraser.png"
            style={{ width: "24px", height: "24px" }}
            alt="Eraser"
          />
        </button>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            opacity: isSelectMode ? 0.5 : 1,
          }}
        >
          <span>{brushWidth}px</span>
          <input
            type="range"
            min="1"
            max="50"
            value={brushWidth}
            onChange={onBrushWidthChange}
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
              appearance: "slider-vertical",
              verticalAlign: "bottom",
            }}
            disabled={isSelectMode}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            backgroundColor: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            flexWrap: "wrap",
            opacity: isSelectMode ? 0.5 : 1,
          }}
        >
          <button
            onClick={() => onBrushTypeChange("pencil")}
            disabled={isSelectMode}
            style={{
              padding: "8px",
              backgroundColor: brushType === "pencil" ? "#2196F3" : "#f5f5f5",
              color: brushType === "pencil" ? "white" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: isSelectMode ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/pencil.png"
              style={{ width: "24px", height: "24px" }}
              alt="Pencil"
            />
          </button>
          <button
            onClick={() => onBrushTypeChange("pen")}
            disabled={isSelectMode}
            style={{
              padding: "8px",
              backgroundColor: brushType === "pen" ? "#2196F3" : "#f5f5f5",
              color: brushType === "pen" ? "white" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: isSelectMode ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/pen.png"
              style={{ width: "24px", height: "24px" }}
              alt="Pen"
            />
          </button>
          <button
            onClick={() => onBrushTypeChange("marker")}
            disabled={isSelectMode}
            style={{
              padding: "8px",
              backgroundColor: brushType === "marker" ? "#2196F3" : "#f5f5f5",
              color: brushType === "marker" ? "white" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: isSelectMode ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/marker.png"
              style={{ width: "24px", height: "24px" }}
              alt="Marker"
            />
          </button>
        </div>

        <ColorPicker
          currentColor={brushColor}
          onColorChange={onColorChange}
          onColorUsed={colorUsed}
          disabled={isSelectMode}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            backgroundColor: "white",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: "8px",
              backgroundColor: "#f5f5f5",
              border: "none",
              borderRadius: "4px",
              cursor: canUndo ? "pointer" : "not-allowed",
              opacity: canUndo ? 1 : 0.15,
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/undo.png"
              style={{ width: "24px", height: "24px" }}
              alt="Undo"
            />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: "8px",
              backgroundColor: "#f5f5f5",
              border: "none",
              borderRadius: "4px",
              cursor: canRedo ? "pointer" : "not-allowed",
              opacity: canRedo ? 1 : 0.15,
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/redo.png"
              style={{ width: "24px", height: "24px" }}
              alt="Redo"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
