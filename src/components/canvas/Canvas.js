import React, { useRef } from "react";
import useCanvasEventListeners from "./CanvasEventListeners";
import CanvasControls from "./components/CanvasControls";

const Canvas = () => {
  const canvasRef = useRef(null);
  const gridCanvasRef = useRef(null);

  const {
    isSelectMode,
    isEraser,
    brushWidth,
    brushType,
    brushColor,
    colorUsed,
    canUndo,
    canRedo,
    showGrid,
    handleSelectModeToggle,
    handleEraserToggle,
    handleBrushWidthChange,
    handleBrushTypeChange,
    handleColorChange,
    handleUndo,
    handleRedo,
    handleGridToggle,
    handleExport,
  } = useCanvasEventListeners({
    showGrid: false,
    canvasRef,
    gridCanvasRef,
  });

  return (
    <>
      <CanvasControls
        isSelectMode={isSelectMode}
        isEraser={isEraser}
        brushWidth={brushWidth}
        brushType={brushType}
        brushColor={brushColor}
        colorUsed={colorUsed}
        canUndo={canUndo}
        canRedo={canRedo}
        showGrid={showGrid}
        onSelectModeToggle={handleSelectModeToggle}
        onEraserToggle={handleEraserToggle}
        onBrushWidthChange={handleBrushWidthChange}
        onBrushTypeChange={handleBrushTypeChange}
        onColorChange={handleColorChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onGridToggle={handleGridToggle}
        onExport={handleExport}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />
      <canvas
        ref={gridCanvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: showGrid ? "transparent" : "#f8f8f8",
          zIndex: 0,
        }}
      />
    </>
  );
};

export default Canvas;
