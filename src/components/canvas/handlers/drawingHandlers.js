import { setupDrawingContext } from "../canvasHelpers";

export const handleCanvasMouseDown = (
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
  if (isSelectMode) {
    const x = event.offsetX;
    const y = event.offsetY;

    // Check if clicking on a resize handle
    if (selectedImage) {
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
    }

    return { type: "drag", x, y };
  } else if (context) {
    setIsMouseDown(true);
    setupContext();
    context.beginPath();
    context.moveTo(event.offsetX, event.offsetY);
    lastPoint.current = { x: event.offsetX, y: event.offsetY };
  }
};

export const handleCanvasMouseMove = (
  event,
  isSelectMode,
  isResizing,
  selectedImage,
  setCurrentPosition
) => {
  event.preventDefault();
  if (isSelectMode) {
    if (isResizing) {
      return { type: "resize", x: event.offsetX, y: event.offsetY };
    } else {
      return { type: "drag", x: event.offsetX, y: event.offsetY };
    }
  } else {
    setCurrentPosition([event.offsetX, event.offsetY]);
  }
};

export const handleCanvasMouseUp = (
  event,
  isSelectMode,
  isResizing,
  setIsMouseDown,
  lastPoint,
  saveCanvasState
) => {
  event.preventDefault();
  if (isSelectMode) {
    if (isResizing) {
      return { type: "resizeEnd" };
    } else {
      return { type: "dragEnd" };
    }
  } else {
    setIsMouseDown(false);
    lastPoint.current = null;
    saveCanvasState();
  }
};
