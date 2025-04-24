import React from "react";
import IconButton from "../button/IconButton";

const Toolbar = ({
  isSelectMode,
  isEraser,
  brushWidth,
  brushType,
  canUndo,
  canRedo,
  onSelectModeToggle,
  onEraserToggle,
  onBrushWidthChange,
  onBrushTypeChange,
  onUndo,
  onRedo,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        flex: "1",
        minWidth: "200px",
      }}
    >
      <IconButton
        isSelected={isSelectMode}
        iconSrc="/icons/select.png"
        iconAlt="Select"
        onClick={onSelectModeToggle}
        isDisabled={isSelectMode}
      />
      <IconButton
        isSelected={isEraser}
        iconSrc="/icons/eraser.png"
        iconAlt="Eraser"
        onClick={onEraserToggle}
        isDisabled={isSelectMode}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          minWidth: "150px",
          opacity: isSelectMode ? 0.5 : 1,
        }}
      >
        <span style={{ minWidth: "40px" }}>{brushWidth}px</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushWidth}
          onChange={(e) => onBrushWidthChange(parseInt(e.target.value))}
          style={{ width: "100px" }}
          disabled={isSelectMode}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          backgroundColor: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          flexWrap: "wrap",
          opacity: isSelectMode ? 0.5 : 1,
        }}
      >
        <IconButton
          isSelected={brushType === "pencil"}
          iconSrc="/icons/pencil.png"
          iconAlt="Pencil"
          onClick={() => onBrushTypeChange("pencil")}
          isDisabled={isSelectMode}
        />
        <IconButton
          isSelected={brushType === "pen"}
          iconSrc="/icons/pen.png"
          iconAlt="Pen"
          onClick={() => onBrushTypeChange("pen")}
          isDisabled={isSelectMode}
        />
        <IconButton
          isSelected={brushType === "marker"}
          iconSrc="/icons/marker.png"
          iconAlt="Marker"
          onClick={() => onBrushTypeChange("marker")}
          isDisabled={isSelectMode}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          backgroundColor: "white",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        <IconButton
          isSelected={false}
          iconSrc="/icons/undo.png"
          iconAlt="Undo"
          onClick={onUndo}
          isDisabled={!canUndo}
        />
        <IconButton
          isSelected={false}
          iconSrc="/icons/redo.png"
          iconAlt="Redo"
          onClick={onRedo}
          isDisabled={!canRedo}
        />
      </div>
    </div>
  );
};

export default Toolbar;
