// Canvas drawing helpers
export const setupDrawingContext = (
  context,
  brushType,
  brushWidth,
  brushColor,
  isEraser
) => {
  if (!context) return;

  context.lineWidth = brushWidth;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (isEraser) {
    context.globalCompositeOperation = "destination-out";
    context.strokeStyle = "rgba(0, 0, 0, 1)";
  } else {
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = brushColor;

    switch (brushType) {
      case "pencil":
        context.lineWidth = Math.max(1, brushWidth * 0.35);
        break;
      case "marker":
        context.globalCompositeOperation = "multiply";
        context.lineWidth = brushWidth * 1.2;
        const markerColor = brushColor.replace(/[\d.]+\)$/, "0.3)");
        context.strokeStyle = markerColor;
        break;
      case "pen":
      default:
        context.lineWidth = brushWidth;
        break;
    }
  }
};

// Touch event helpers
export const getTouchPosition = (touch, canvas) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
    rect,
  };
};

export const handleTouchStart = (
  event,
  context,
  isSelectMode,
  selectedImage,
  setIsMouseDown,
  setCurrentPosition,
  lastPoint,
  setupContext
) => {
  event.preventDefault();
  const touch = event.touches[0];
  const { x, y } = getTouchPosition(touch, context.canvas);

  if (isSelectMode) {
    return handleSelectModeTouchStart(x, y, selectedImage, event);
  } else if (context) {
    setIsMouseDown(true);
    setupContext();
    context.beginPath();
    context.moveTo(x, y);
    lastPoint.current = { x, y };
    setCurrentPosition([x, y]);
  }
};

export const handleTouchMove = (
  event,
  isSelectMode,
  isResizing,
  selectedImage,
  setCurrentPosition
) => {
  event.preventDefault();
  const touch = event.touches[0];
  const { x, y } = getTouchPosition(touch, event.target);

  if (isSelectMode) {
    return handleSelectModeTouchMove(x, y, isResizing, selectedImage, event);
  } else {
    setCurrentPosition([x, y]);
  }
};

export const handleTouchEnd = (
  event,
  isSelectMode,
  isResizing,
  setIsMouseDown,
  lastPoint,
  saveCanvasState
) => {
  event.preventDefault();

  if (isSelectMode) {
    return handleSelectModeTouchEnd(isResizing);
  } else {
    setIsMouseDown(false);
    lastPoint.current = null;
    saveCanvasState();
  }
};

// Selection mode helpers
const handleSelectModeTouchStart = (x, y, selectedImage, event) => {
  if (!selectedImage) return;

  const handleSize = 8;
  const handles = [
    {
      x: selectedImage.x - handleSize / 2,
      y: selectedImage.y - handleSize / 2,
      type: "nw",
    },
    {
      x: selectedImage.x + selectedImage.width / 2 - handleSize / 2,
      y: selectedImage.y - handleSize / 2,
      type: "n",
    },
    {
      x: selectedImage.x + selectedImage.width - handleSize / 2,
      y: selectedImage.y - handleSize / 2,
      type: "ne",
    },
    {
      x: selectedImage.x - handleSize / 2,
      y: selectedImage.y + selectedImage.height / 2 - handleSize / 2,
      type: "w",
    },
    {
      x: selectedImage.x + selectedImage.width - handleSize / 2,
      y: selectedImage.y + selectedImage.height / 2 - handleSize / 2,
      type: "e",
    },
    {
      x: selectedImage.x - handleSize / 2,
      y: selectedImage.y + selectedImage.height - handleSize / 2,
      type: "sw",
    },
    {
      x: selectedImage.x + selectedImage.width / 2 - handleSize / 2,
      y: selectedImage.y + selectedImage.height - handleSize / 2,
      type: "s",
    },
    {
      x: selectedImage.x + selectedImage.width - handleSize / 2,
      y: selectedImage.y + selectedImage.height - handleSize / 2,
      type: "se",
    },
  ];

  const clickedHandle = handles.find(
    (handle) =>
      x >= handle.x &&
      x <= handle.x + handleSize &&
      y >= handle.y &&
      y <= handle.y + handleSize
  );

  if (clickedHandle) {
    return { type: "resize", handle: clickedHandle.type, x, y };
  }

  return { type: "drag", x, y };
};

const handleSelectModeTouchMove = (x, y, isResizing, selectedImage, event) => {
  if (isResizing) {
    return { type: "resize", x, y };
  } else {
    return { type: "drag", x, y };
  }
};

const handleSelectModeTouchEnd = (isResizing) => {
  return { type: isResizing ? "resizeEnd" : "dragEnd" };
};
