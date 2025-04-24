import { useEffect, useRef, useState } from "react";
import CanvasEventListeners from "./CanvasEventListeners";
import { drawGridLines } from "../../helpers/grid";

function Canvas() {
  const canvasRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const [showGrid, setShowGrid] = useState(false);

  const handleExport = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const gridCanvas = gridCanvasRef.current;

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;
      gridCanvas.width = width;
      gridCanvas.height = height;

      // Draw initial grid
      const gridContext = gridCanvas.getContext("2d");
      drawGridLines({ current: gridContext });
    };

    // Initial resize and grid draw
    resizeCanvas();

    // Add event listener for window resize
    window.addEventListener("resize", resizeCanvas);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <>
      <CanvasEventListeners
        showGrid={showGrid}
        canvasRef={canvasRef}
        gridCanvasRef={gridCanvasRef}
      />
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
          onClick={() => setShowGrid(!showGrid)}
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
          onClick={handleExport}
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
      <canvas
        ref={gridCanvasRef}
        id="gridCanvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: showGrid ? "block" : "none",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={canvasRef}
        id="canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 2,
          backgroundColor: showGrid ? "transparent" : "#f8f8f8",
        }}
      />
    </>
  );
}

export default Canvas;
