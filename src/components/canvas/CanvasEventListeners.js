import { useEffect, useRef, useState } from "react";
import { drawGridLines } from "../../helpers/grid";

function CanvasEventListeners({ showGrid, canvasRef, gridCanvasRef }) {
  const [isMouseDown, setIsMouseDown] = useState(null);
  const [currentPosition, setCurrentPosition] = useState([-1, -1]);
  const context = useRef();
  const gridContext = useRef();

  useEffect(() => {
    if (canvasRef.current && gridCanvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
      gridContext.current = gridCanvasRef.current.getContext("2d");

      // Set up drawing context
      context.current.lineWidth = 10;
      context.current.strokeStyle = "white";

      // Draw initial grid
      if (showGrid) {
        drawGridLines(gridContext);
      }

      // Add event listeners to the drawing canvas
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
  }, [canvasRef, gridCanvasRef]);

  useEffect(() => {
    if (gridCanvasRef.current) {
      // Clear grid canvas
      gridContext.current.clearRect(
        0,
        0,
        gridCanvasRef.current.width,
        gridCanvasRef.current.height
      );

      // Redraw grid if enabled
      if (showGrid) {
        drawGridLines(gridContext);
      }
    }
  }, [showGrid]);

  useEffect(() => {
    if (isMouseDown) {
      context.current.lineTo(currentPosition[0], currentPosition[1]);
      context.current.stroke();
    }
  }, [currentPosition, isMouseDown]);

  function handleCanvasMouseDown(event) {
    event.preventDefault();
    setIsMouseDown(true);
    context.current.beginPath();
    context.current.moveTo(event.offsetX, event.offsetY);
  }

  function handleCanvasMouseMove(event) {
    event.preventDefault();
    setCurrentPosition([event.offsetX, event.offsetY]);
  }

  function handleCanvasMouseUp(event) {
    event.preventDefault();
    setIsMouseDown(false);
  }

  return null; // We don't need to render anything here as the canvases are rendered in the Canvas component
}

export default CanvasEventListeners;
