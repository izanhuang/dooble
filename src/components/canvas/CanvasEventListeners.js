import { useEffect, useRef, useState } from "react";
import { drawGridLines } from "../../helpers/grid";

function CanvasEventListeners() {
  const [canvas, setCanvas] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(null);
  const [currentPosition, setCurrentPosition] = useState([-1, -1]);
  const context = useRef();

  useEffect(() => {
    if (!canvas) {
      setCanvas(document.getElementById("canvas"));
    } else {
      context.current = canvas.getContext("2d");

      // canvas background
      drawGridLines(context);

      // brush size
      context.current.lineWidth = 10;
      // brush color
      context.current.strokeStyle = "white";

      canvas.addEventListener("mousedown", handleCanvasMouseDown);
      canvas.addEventListener("mousemove", handleCanvasMouseMove);
      canvas.addEventListener("mouseup", handleCanvasMouseUp);
    }
  }, [canvas]);

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
}

export default CanvasEventListeners;
