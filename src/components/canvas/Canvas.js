import CanvasEventListeners from "../../helpers/listeners";

function Canvas() {
  return (
    <div>
      <CanvasEventListeners />
      <canvas id="canvas" width="500" height="500"></canvas>;
    </div>
  );
}

export default Canvas;
