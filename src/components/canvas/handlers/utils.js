export const hexToRgba = (hex, opacity) => {
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

export const addNoise = (ctx, x, y, width, color) => {
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

export const drawSelectionIndicator = (context, selectedImage) => {
  if (!selectedImage || !context) return;

  // Save the current canvas state
  context.save();

  // Draw selection rectangle
  context.strokeStyle = "#2196F3";
  context.lineWidth = 2;
  context.setLineDash([5, 5]);
  context.strokeRect(
    selectedImage.x - 2,
    selectedImage.y - 2,
    selectedImage.width + 4,
    selectedImage.height + 4
  );

  // Draw resize handles
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

  handles.forEach((handle) => {
    context.fillStyle = "#2196F3";
    context.fillRect(handle.x, handle.y, handleSize, handleSize);
  });

  // Restore the canvas state
  context.restore();
};
