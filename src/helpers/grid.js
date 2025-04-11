function drawGridLines(context) {
  context.current.beginPath();
  context.current.lineWidth = 1;
  context.current.strokeStyle = "white";
  context.current.fillStyle = "transparent";

  for (let i = 0; i <= 500; i += 10) {
    // vertical
    context.current.moveTo(i, 0); // [[0,0], [100,0], [200,0], ...]
    context.current.lineTo(i, 500); // [[0,500], [100,500], [200,500], ...]

    // horizontal
    context.current.moveTo(0, i); // [[0,0], [0,100], [0,200], ...]
    context.current.lineTo(500, i); // [[500,0], [500,100], [500,200], ...]

    context.current.stroke();
  }
  context.current.closePath();
}

export { drawGridLines };
