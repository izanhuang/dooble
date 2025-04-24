export const saveCanvasState = (
  canvasRef,
  canvasHistory,
  setCanUndo,
  setCanRedo
) => {
  if (canvasRef.current) {
    canvasHistory.current.saveState(canvasRef.current);
    setCanUndo(canvasHistory.current.canUndo());
    setCanRedo(canvasHistory.current.canRedo());
  }
};

export const handleUndo = (
  canvasRef,
  canvasHistory,
  setCanUndo,
  setCanRedo
) => {
  if (canvasRef.current && canvasHistory.current.undo(canvasRef.current)) {
    setCanUndo(canvasHistory.current.canUndo());
    setCanRedo(canvasHistory.current.canRedo());
  }
};

export const handleRedo = (
  canvasRef,
  canvasHistory,
  setCanUndo,
  setCanRedo
) => {
  if (canvasRef.current && canvasHistory.current.redo(canvasRef.current)) {
    setCanUndo(canvasHistory.current.canUndo());
    setCanRedo(canvasHistory.current.canRedo());
  }
};

export const handleSelectModeToggle = (
  canvasRef,
  context,
  isSelectMode,
  setIsSelectMode,
  setIsEraser
) => {
  // Store current canvas content
  const currentContent = canvasRef.current.toDataURL();

  // Toggle select mode
  setIsSelectMode(!isSelectMode);

  // Restore canvas content after mode change
  const img = new Image();
  img.onload = () => {
    context.current.drawImage(img, 0, 0);
  };
  img.src = currentContent;

  // Reset other modes when entering select mode
  if (!isSelectMode) {
    setIsEraser(false);
  }
};

export const redrawCanvas = (context, canvasRef) => {
  if (!context.current) return;

  // Store current content
  const currentContent = canvasRef.current.toDataURL();

  // Clear the canvas
  context.current.clearRect(
    0,
    0,
    canvasRef.current.width,
    canvasRef.current.height
  );

  // Restore content
  const img = new Image();
  img.onload = () => {
    context.current.drawImage(img, 0, 0);
  };
  img.src = currentContent;
};
