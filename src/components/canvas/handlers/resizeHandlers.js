export const handleResizeStart = (
  e,
  handle,
  isSelectMode,
  selectedImage,
  setIsResizing,
  setResizeHandle,
  setDragStart
) => {
  if (!isSelectMode || !selectedImage) return;
  setIsResizing(true);
  setResizeHandle(handle);
  setDragStart({ x: e.offsetX, y: e.offsetY });
};

export const handleResize = (
  e,
  isResizing,
  selectedImage,
  resizeHandle,
  setSelectedImage,
  setDragStart,
  dragStart
) => {
  if (!isResizing || !selectedImage || !resizeHandle) return;

  const dx = e.offsetX - dragStart.x;
  const dy = e.offsetY - dragStart.y;

  let newX = selectedImage.x;
  let newY = selectedImage.y;
  let newWidth = selectedImage.width;
  let newHeight = selectedImage.height;

  switch (resizeHandle) {
    case "nw":
      newX += dx;
      newY += dy;
      newWidth -= dx;
      newHeight -= dy;
      break;
    case "n":
      newY += dy;
      newHeight -= dy;
      break;
    case "ne":
      newY += dy;
      newWidth += dx;
      newHeight -= dy;
      break;
    case "w":
      newX += dx;
      newWidth -= dx;
      break;
    case "e":
      newWidth += dx;
      break;
    case "sw":
      newX += dx;
      newWidth -= dx;
      newHeight += dy;
      break;
    case "s":
      newHeight += dy;
      break;
    case "se":
      newWidth += dx;
      newHeight += dy;
      break;
  }

  // Ensure minimum size
  if (newWidth < 10) newWidth = 10;
  if (newHeight < 10) newHeight = 10;

  setSelectedImage({
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  });

  setDragStart({ x: e.offsetX, y: e.offsetY });
};

export const handleResizeEnd = (
  isResizing,
  setIsResizing,
  setResizeHandle,
  saveCanvasState
) => {
  if (!isResizing) return;
  setIsResizing(false);
  setResizeHandle(null);
  saveCanvasState();
};
