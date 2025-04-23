import { useEffect, useRef, useState } from "react";
import { drawGridLines } from "../../helpers/grid";
import ColorPicker from "./ColorPicker";

function CanvasEventListeners({ showGrid, canvasRef, gridCanvasRef }) {
  const [isMouseDown, setIsMouseDown] = useState(null);
  const [currentPosition, setCurrentPosition] = useState([-1, -1]);
  const [isEraser, setIsEraser] = useState(false);
  const [brushWidth, setBrushWidth] = useState(8);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [colorUsed, setColorUsed] = useState(0);
  const [brushType, setBrushType] = useState("pen");
  const context = useRef();
  const gridContext = useRef();
  const lastPoint = useRef(null);

  // Brush size presets
  const brushSizePresets = {
    pencil: 4,
    pen: 8,
    marker: 12,
  };

  // Handle brush type change
  const handleBrushTypeChange = (type) => {
    setBrushType(type);
    setBrushWidth(brushSizePresets[type]);
  };

  // Convert hex color to RGBA
  const hexToRgba = (hex, opacity) => {
    let color = hex.startsWith("#") ? hex : `#${hex}`;

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

  // Add noise to create pencil effect
  const addNoise = (ctx, x, y, width, color) => {
    const baseOpacity = parseFloat(color.match(/[\d.]+\)$/)?.[0] || 1);
    const pressure = 0.3 + Math.random() * 0.7;

    // Draw main line with varying width
    const lineWidth = width * (0.3 + pressure * 0.4);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    // Single line with natural variation
    ctx.beginPath();
    ctx.moveTo(x - width / 4, y);
    ctx.lineTo(x + width / 4, y);
    ctx.stroke();
  };

  const handleColorChange = (color, opacity) => {
    const newColor = hexToRgba(color, opacity);
    setBrushColor(newColor);
    setBrushOpacity(opacity);
  };

  // Set up drawing context based on brush type
  const setupContext = () => {
    if (context.current) {
      context.current.lineWidth = brushWidth;
      context.current.lineCap = "round";
      context.current.lineJoin = "round";

      if (!isEraser) {
        context.current.strokeStyle = brushColor;

        switch (brushType) {
          case "pencil":
            context.current.globalCompositeOperation = "source-over";
            context.current.lineWidth = Math.max(1, brushWidth * 0.35);
            break;
          case "marker":
            context.current.globalCompositeOperation = "multiply";
            context.current.lineWidth = brushWidth * 1.2;
            // Make marker more transparent
            const markerColor = brushColor.replace(/[\d.]+\)$/, "0.3)");
            context.current.strokeStyle = markerColor;
            break;
          case "pen":
          default:
            context.current.globalCompositeOperation = "source-over";
            context.current.lineWidth = brushWidth;
            break;
        }
      } else {
        context.current.strokeStyle = "#f8f8f8";
        context.current.globalCompositeOperation = "source-over";
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
  }, [canvasRef, gridCanvasRef, isEraser, brushWidth, brushColor, brushType]);

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

      if (brushType === "pencil" && lastPoint.current) {
        // Draw line
        context.current.beginPath();
        context.current.moveTo(lastPoint.current.x, lastPoint.current.y);
        context.current.lineTo(currentPosition[0], currentPosition[1]);
        context.current.stroke();

        // Add pencil texture
        addNoise(
          context.current,
          currentPosition[0],
          currentPosition[1],
          brushWidth,
          brushColor
        );
      } else {
        context.current.lineTo(currentPosition[0], currentPosition[1]);
        context.current.stroke();
      }

      lastPoint.current = { x: currentPosition[0], y: currentPosition[1] };
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
      lastPoint.current = { x: event.offsetX, y: event.offsetY };
    }
  }

  function handleCanvasMouseMove(event) {
    event.preventDefault();
    setCurrentPosition([event.offsetX, event.offsetY]);
  }

  function handleCanvasMouseUp(event) {
    event.preventDefault();
    setIsMouseDown(false);
    lastPoint.current = null;
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
      <div
        style={{
          display: "flex",
          gap: "8px",
          backgroundColor: "white",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        <button
          onClick={() => handleBrushTypeChange("pencil")}
          style={{
            padding: "8px",
            backgroundColor: brushType === "pencil" ? "#2196F3" : "#f5f5f5",
            color: brushType === "pencil" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Pencil
        </button>
        <button
          onClick={() => handleBrushTypeChange("pen")}
          style={{
            padding: "8px",
            backgroundColor: brushType === "pen" ? "#2196F3" : "#f5f5f5",
            color: brushType === "pen" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Pen
        </button>
        <button
          onClick={() => handleBrushTypeChange("marker")}
          style={{
            padding: "8px",
            backgroundColor: brushType === "marker" ? "#2196F3" : "#f5f5f5",
            color: brushType === "marker" ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Marker
        </button>
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
