export const handleImageSelect = (
  x,
  y,
  context,
  isSelectMode,
  selectedImage,
  setSelectedImage,
  setOriginalImage
) => {
  if (!isSelectMode) return;

  // If clicking on the currently selected image, do nothing
  if (
    selectedImage &&
    x >= selectedImage.x &&
    x <= selectedImage.x + selectedImage.width &&
    y >= selectedImage.y &&
    y <= selectedImage.y + selectedImage.height
  ) {
    return;
  }

  // Check if click is on an image
  const imageData = context.getImageData(x, y, 1, 1).data;
  if (imageData[3] > 0) {
    // If pixel is not transparent
    // Get the image dimensions by scanning the canvas
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;

    // Scan horizontally
    for (let i = x; i >= 0; i--) {
      const pixel = context.getImageData(i, y, 1, 1).data;
      if (pixel[3] === 0) break;
      minX = i;
    }
    for (let i = x; i < context.canvas.width; i++) {
      const pixel = context.getImageData(i, y, 1, 1).data;
      if (pixel[3] === 0) break;
      maxX = i;
    }

    // Scan vertically
    for (let i = y; i >= 0; i--) {
      const pixel = context.getImageData(x, i, 1, 1).data;
      if (pixel[3] === 0) break;
      minY = i;
    }
    for (let i = y; i < context.canvas.height; i++) {
      const pixel = context.getImageData(x, i, 1, 1).data;
      if (pixel[3] === 0) break;
      maxY = i;
    }

    // Store the original image data
    const imageData = context.getImageData(
      minX,
      minY,
      maxX - minX + 1,
      maxY - minY + 1
    );
    setOriginalImage(imageData);

    // Clear any existing selection
    setSelectedImage(null);

    // Set new selection after a small delay to ensure the previous selection is cleared
    setTimeout(() => {
      setSelectedImage({
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      });
    }, 0);
  } else {
    // Only deselect if clicking outside the current selection
    if (
      selectedImage &&
      (x < selectedImage.x ||
        x > selectedImage.x + selectedImage.width ||
        y < selectedImage.y ||
        y > selectedImage.y + selectedImage.height)
    ) {
      setSelectedImage(null);
      setOriginalImage(null);
    }
  }
};

export const handleImageDragStart = (
  e,
  isSelectMode,
  selectedImage,
  setIsDraggingImage,
  setDragStart
) => {
  if (!isSelectMode || !selectedImage) return;
  setIsDraggingImage(true);
  setDragStart({ x: e.offsetX, y: e.offsetY });
};

export const handleImageDrag = (
  e,
  isSelectMode,
  selectedImage,
  isDraggingImage,
  setSelectedImage,
  setDragStart,
  dragStart
) => {
  if (!isSelectMode || !selectedImage || !isDraggingImage) return;

  const dx = e.offsetX - dragStart.x;
  const dy = e.offsetY - dragStart.y;

  // Update image position
  setSelectedImage((prev) => ({
    ...prev,
    x: prev.x + dx,
    y: prev.y + dy,
  }));

  setDragStart({ x: e.offsetX, y: e.offsetY });
};

export const handleImageDragEnd = (setIsDraggingImage, saveCanvasState) => {
  setIsDraggingImage(false);
  saveCanvasState();
};
