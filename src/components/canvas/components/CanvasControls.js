import React from "react";
import ColorPicker from "./ColorPicker";
import Toolbar from "./Toolbar";
import GridControls from "./GridControls";

const CanvasControls = ({
  isSelectMode,
  isEraser,
  brushWidth,
  brushType,
  brushColor,
  colorUsed,
  canUndo,
  canRedo,
  showGrid,
  onSelectModeToggle,
  onEraserToggle,
  onBrushWidthChange,
  onBrushTypeChange,
  onColorChange,
  onUndo,
  onRedo,
  onGridToggle,
  onExport,
}) => {
  return (
    <>
      <Toolbar
        isSelectMode={isSelectMode}
        isEraser={isEraser}
        brushWidth={brushWidth}
        brushType={brushType}
        brushColor={brushColor}
        colorUsed={colorUsed}
        canUndo={canUndo}
        canRedo={canRedo}
        onSelectModeToggle={onSelectModeToggle}
        onEraserToggle={onEraserToggle}
        onBrushWidthChange={onBrushWidthChange}
        onBrushTypeChange={onBrushTypeChange}
        onColorChange={onColorChange}
        onUndo={onUndo}
        onRedo={onRedo}
      />
      <GridControls
        showGrid={showGrid}
        onGridToggle={onGridToggle}
        onExport={onExport}
      />
    </>
  );
};

export default CanvasControls;
