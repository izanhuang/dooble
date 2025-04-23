function drawGridLines(context) {
  const canvas = context.current.canvas;
  const width = canvas.width;
  const height = canvas.height;
  const gridSize = 20; // Size of each grid cell

  // Fill background with white
  context.current.fillStyle = "#ffffff";
  context.current.fillRect(0, 0, width, height);

  // Draw checkerboard pattern
  context.current.fillStyle = "#f5f5f5";

  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      // Alternate between white and gray
      if ((x / gridSize + y / gridSize) % 2 === 0) {
        context.current.fillRect(x, y, gridSize, gridSize);
      }
    }
  }
}

export { drawGridLines };
