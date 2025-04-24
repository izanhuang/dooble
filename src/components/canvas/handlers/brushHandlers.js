import { hexToRgba } from "./utils";

export const handleBrushTypeChange = (
  type,
  setBrushType,
  setBrushWidth,
  setIsEraser
) => {
  const brushSizePresets = {
    pencil: 4,
    pen: 8,
    marker: 12,
  };

  setBrushType(type);
  setBrushWidth(brushSizePresets[type]);
  setIsEraser(false); // Deselect eraser when selecting a brush type
};

export const handleEraserToggle = (isEraser, setIsEraser, setBrushType) => {
  setIsEraser(!isEraser);
  if (!isEraser) {
    setBrushType(null); // Deselect brush type when selecting eraser
  }
};

export const handleColorChange = (
  color,
  opacity,
  setBrushColor,
  setBrushOpacity
) => {
  const newColor = hexToRgba(color, opacity);
  setBrushColor(newColor);
  setBrushOpacity(opacity);
};
