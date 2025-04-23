import { useEffect, useRef, useState } from "react";
import { drawGridLines } from "../../helpers/grid";
import ColorPicker from "./ColorPicker";

function CanvasEventListeners({ showGrid, canvasRef, gridCanvasRef }) {
  const [isMouseDown, setIsMouseDown] = useState(null);
  const [currentPosition, setCurrentPosition] = useState([-1, -1]);
  const [isEraser, setIsEraser] = useState(false);
  const [brushWidth, setBrushWidth] = useState(10);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [colorUsed, setColorUsed] = useState(0);
  const context = useRef();
  const gridContext = useRef();

  // Convert hex color to RGBA
  const hexToRgba = (hex, opacity) => {
    // Ensure hex starts with #
    let color = hex.startsWith("#") ? hex : `#${hex}`;

    // Handle 3-digit hex
    if (color.length === 4) {
      color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  const handleColorChange = (color, opacity) => {
    // Treat opacity change as a new color
    const newColor = hexToRgba(color, opacity);
    setBrushColor(newColor);
    setBrushOpacity(opacity);
  };

  // Set up drawing context
  const setupContext = () => {
    if (context.current) {
      context.current.lineWidth = brushWidth;
      context.current.lineCap = "round";
      context.current.lineJoin = "round";
      if (!isEraser) {
        context.current.strokeStyle = brushColor;
      } else {
        context.current.strokeStyle = "#f8f8f8";
      }
    }
  };

  useEffect(() => {
    if (canvasRef.current && gridCanvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
      gridContext.current = gridCanvasRef.current.getContext("2d");
      setupContext();

      if (showGrid && gridContext.current) {
        drawGridLines(gridContext);
      }

      const canvas = canvasRef.current;
      canvas.addEventListener("mousedown", handleCanvasMouseDown);
      canvas.addEventListener("mousemove", handleCanvasMouseMove);
      canvas.addEventListener("mouseup", handleCanvasMouseUp);

      return () => {
        canvas.removeEventListener("mousedown", handleCanvasMouseDown);
        canvas.removeEventListener("mousemove", handleCanvasMouseMove);
        canvas.removeEventListener("mouseup", handleCanvasMouseUp);
      };
    }
  }, [canvasRef, gridCanvasRef, isEraser, brushWidth, brushColor]);

  useEffect(() => {
    if (gridCanvasRef.current && gridContext.current) {
      gridContext.current.clearRect(
        0,
        0,
        gridCanvasRef.current.width,
        gridCanvasRef.current.height
      );

      if (showGrid) {
        drawGridLines(gridContext);
      }
    }
  }, [showGrid]);

  useEffect(() => {
    if (isMouseDown && context.current) {
      setupContext();
      context.current.lineTo(currentPosition[0], currentPosition[1]);
      context.current.stroke();
      setColorUsed((prev) => prev + 1);
    }
  }, [currentPosition, isMouseDown]);

  function handleCanvasMouseDown(event) {
    event.preventDefault();
    if (context.current) {
      setIsMouseDown(true);
      setupContext();
      context.current.beginPath();
      context.current.moveTo(event.offsetX, event.offsetY);
    }
  }

  function handleCanvasMouseMove(event) {
    event.preventDefault();
    setCurrentPosition([event.offsetX, event.offsetY]);
  }

  function handleCanvasMouseUp(event) {
    event.preventDefault();
    setIsMouseDown(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        zIndex: 1000,
        display: "flex",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <button
        onClick={() => setIsEraser(!isEraser)}
        style={{
          padding: "8px 16px",
          backgroundColor: isEraser ? "#f44336" : "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {isEraser ? "Switch to Pen" : "Switch to Eraser"}
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "white",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        <span style={{ minWidth: "40px" }}>{brushWidth}px</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushWidth}
          onChange={(e) => setBrushWidth(parseInt(e.target.value))}
          style={{ width: "100px" }}
        />
      </div>
      <ColorPicker
        currentColor={brushColor}
        onColorChange={handleColorChange}
        onColorUsed={colorUsed}
      />
    </div>
  );
}

export default CanvasEventListeners;
