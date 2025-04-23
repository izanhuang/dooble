// Flood fill algorithm to fill closed areas
export const floodFill = (ctx, x, y, fillColor) => {
  // Get the canvas dimensions
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  // Get the color at the clicked point
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const targetColor = getColorAtPixel(data, x, y, width);

  // If the target color is the same as the fill color, do nothing
  if (colorsMatch(targetColor, hexToRgb(fillColor))) {
    return;
  }

  // Create a stack for the pixels to process
  const stack = [[x, y]];
  const visited = new Set();

  // Process the stack
  while (stack.length > 0) {
    const [currentX, currentY] = stack.pop();
    const index = (currentY * width + currentX) * 4;

    // Skip if out of bounds or already visited
    if (
      currentX < 0 ||
      currentX >= width ||
      currentY < 0 ||
      currentY >= height ||
      visited.has(`${currentX},${currentY}`)
    ) {
      continue;
    }

    // Get the color at the current pixel
    const currentColor = [
      data[index],
      data[index + 1],
      data[index + 2],
      data[index + 3],
    ];

    // If the color matches the target color, fill it
    if (colorsMatch(currentColor, targetColor)) {
      // Fill the pixel
      const [r, g, b, a] = hexToRgb(fillColor);
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = a;

      // Mark as visited
      visited.add(`${currentX},${currentY}`);

      // Add neighboring pixels to the stack
      stack.push([currentX + 1, currentY]);
      stack.push([currentX - 1, currentY]);
      stack.push([currentX, currentY + 1]);
      stack.push([currentX, currentY - 1]);
    }
  }

  // Update the canvas with the filled area
  ctx.putImageData(imageData, 0, 0);
};

// Helper function to get color at a specific pixel
const getColorAtPixel = (data, x, y, width) => {
  const index = (y * width + x) * 4;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255,
      ]
    : [0, 0, 0, 255];
};

// Helper function to compare colors
const colorsMatch = (color1, color2) => {
  return (
    Math.abs(color1[0] - color2[0]) < 10 &&
    Math.abs(color1[1] - color2[1]) < 10 &&
    Math.abs(color1[2] - color2[2]) < 10 &&
    Math.abs(color1[3] - color2[3]) < 10
  );
};
