function drawGridLines(context) {
  const canvas = context.current.canvas;
  const width = canvas.width;
  const height = canvas.height;
  const gridSize = 20; // Size of each grid cell

  // Fill background with light gray
  context.current.fillStyle = "#e0e0e0";
  context.current.fillRect(0, 0, width, height);

  context.current.beginPath();
  context.current.lineWidth = 1;
  context.current.strokeStyle = "#f5f5f5"; // Light gray grid lines
  context.current.fillStyle = "transparent";

  // Draw vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    context.current.moveTo(x, 0);
    context.current.lineTo(x, height);
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    context.current.moveTo(0, y);
    context.current.lineTo(width, y);
  }

  context.current.stroke();
  context.current.closePath();
}

export { drawGridLines };
