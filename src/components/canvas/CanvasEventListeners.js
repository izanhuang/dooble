import { useEffect, useRef, useState } from "react";
import { drawGridLines } from "../../helpers/grid";
import { CanvasHistory } from "./canvasHistory";
import { floodFill } from "./floodFill";
import {
  setupDrawingContext,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} from "./canvasHelpers";
import {
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
} from "./handlers/drawingHandlers";
import {
  handleImageSelect,
  handleImageDragStart,
  handleImageDrag,
  handleImageDragEnd,
} from "./handlers/imageHandlers";
import {
  handleResizeStart,
  handleResize,
  handleResizeEnd,
} from "./handlers/resizeHandlers";
import { hexToRgba, addNoise, drawSelectionIndicator } from "./handlers/utils";
import {
  handleBrushTypeChange,
  handleEraserToggle,
  handleColorChange,
} from "./handlers/brushHandlers";
import {
  saveCanvasState,
  handleUndo,
  handleRedo,
  handleSelectModeToggle,
  redrawCanvas,
} from "./handlers/canvasStateHandlers";

function useCanvasEventListeners({
  showGrid: initialShowGrid,
  canvasRef,
  gridCanvasRef,
}) {
  const [isMouseDown, setIsMouseDown] = useState(null);
  const [currentPosition, setCurrentPosition] = useState([-1, -1]);
  const [isEraser, setIsEraser] = useState(false);
  const [brushWidth, setBrushWidth] = useState(8);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [colorUsed, setColorUsed] = useState(0);
  const [brushType, setBrushType] = useState("pen");
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const context = useRef();
  const gridContext = useRef();
  const lastPoint = useRef(null);
  const canvasHistory = useRef(new CanvasHistory());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalImage, setOriginalImage] = useState(null);

  // Set up drawing context based on brush type
  const setupContext = () => {
    setupDrawingContext(
      context.current,
      brushType,
      brushWidth,
      brushColor,
      isEraser
    );
  };

  // Handle color drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (context.current) {
      const draggedColor = e.dataTransfer.getData("text/plain");
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Use the dragged color for flood fill
      floodFill(context.current, x, y, draggedColor);
      saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo);
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle image paste
  const handlePaste = (e) => {
    e.preventDefault();
    if (!context.current) return;

    // Check if there are any files in the clipboard
    if (e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvasWidth = canvasRef.current.width;
            const canvasHeight = canvasRef.current.height;

            // Calculate scaling factor to fit the image within the canvas
            const scale = Math.min(
              canvasWidth / img.width,
              canvasHeight / img.height,
              1 // Don't scale up if image is smaller than canvas
            );

            // Calculate new dimensions
            const newWidth = img.width * scale;
            const newHeight = img.height * scale;

            // Calculate position to center the scaled image
            const x = (canvasWidth - newWidth) / 2;
            const y = (canvasHeight - newHeight) / 2;

            // Draw the scaled image
            context.current.drawImage(img, x, y, newWidth, newHeight);
            saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Set up canvas and event listeners
  useEffect(() => {
    if (canvasRef.current && gridCanvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
      gridContext.current = gridCanvasRef.current.getContext("2d");
      setupContext();

      // Set canvas dimensions to match window size
      const updateCanvasSize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Store current canvas content
        const currentContent = canvasRef.current.toDataURL();

        // Update canvas dimensions
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        gridCanvasRef.current.width = width;
        gridCanvasRef.current.height = height;

        // Restore canvas content
        const img = new Image();
        img.onload = () => {
          context.current.drawImage(img, 0, 0);
          if (showGrid && gridContext.current) {
            drawGridLines(gridContext);
          }
        };
        img.src = currentContent;
      };

      // Initial size setup
      updateCanvasSize();

      // Add resize listener
      window.addEventListener("resize", updateCanvasSize);

      const canvas = canvasRef.current;
      canvas.addEventListener("mousedown", (e) => {
        const result = handleCanvasMouseDown(
          e,
          context.current,
          isSelectMode,
          selectedImage,
          setIsMouseDown,
          setCurrentPosition,
          lastPoint,
          setupContext
        );

        if (result && isSelectMode) {
          if (result.type === "resize") {
            handleResizeStart(
              { offsetX: result.x, offsetY: result.y },
              result.handle,
              isSelectMode,
              selectedImage,
              setIsResizing,
              setResizeHandle,
              setDragStart
            );
          } else if (result.type === "drag") {
            handleImageSelect(
              result.x,
              result.y,
              context.current,
              isSelectMode,
              selectedImage,
              setSelectedImage,
              setOriginalImage
            );
            handleImageDragStart(
              { offsetX: result.x, offsetY: result.y },
              isSelectMode,
              selectedImage,
              setIsDraggingImage,
              setDragStart
            );
          }
        }
      });

      canvas.addEventListener("mousemove", (e) => {
        const result = handleCanvasMouseMove(
          e,
          isSelectMode,
          isResizing,
          selectedImage,
          setCurrentPosition
        );

        if (result && isSelectMode) {
          if (result.type === "resize") {
            handleResize(
              { offsetX: result.x, offsetY: result.y },
              isResizing,
              selectedImage,
              resizeHandle,
              setSelectedImage,
              setDragStart,
              dragStart
            );
          } else if (result.type === "drag") {
            handleImageDrag(
              { offsetX: result.x, offsetY: result.y },
              isSelectMode,
              selectedImage,
              isDraggingImage,
              setSelectedImage,
              setDragStart,
              dragStart
            );
          }
          drawSelectionIndicator(context.current, selectedImage);
        }
      });

      canvas.addEventListener("mouseup", (e) => {
        const result = handleCanvasMouseUp(
          e,
          isSelectMode,
          isResizing,
          setIsMouseDown,
          lastPoint,
          () =>
            saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo)
        );

        if (result && isSelectMode) {
          if (result.type === "resizeEnd") {
            handleResizeEnd(isResizing, setIsResizing, setResizeHandle, () =>
              saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo)
            );
          } else if (result.type === "dragEnd") {
            handleImageDragEnd(setIsDraggingImage, () =>
              saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo)
            );
          }
          drawSelectionIndicator(context.current, selectedImage);
        }
      });

      canvas.addEventListener("drop", handleDrop);
      canvas.addEventListener("dragover", handleDragOver);
      document.addEventListener("paste", handlePaste);

      // Add touch event listeners
      canvas.addEventListener("touchstart", (e) => {
        const result = handleTouchStart(
          e,
          context.current,
          isSelectMode,
          selectedImage,
          setIsMouseDown,
          setCurrentPosition,
          lastPoint,
          setupContext
        );

        if (result && isSelectMode) {
          if (result.type === "resize") {
            handleResizeStart(
              { offsetX: result.x, offsetY: result.y },
              result.handle,
              isSelectMode,
              selectedImage,
              setIsResizing,
              setResizeHandle,
              setDragStart
            );
          } else if (result.type === "drag") {
            handleImageSelect(
              result.x,
              result.y,
              context.current,
              isSelectMode,
              selectedImage,
              setSelectedImage,
              setOriginalImage
            );
            handleImageDragStart(
              { offsetX: result.x, offsetY: result.y },
              isSelectMode,
              selectedImage,
              setIsDraggingImage,
              setDragStart
            );
          }
        }
      });

      canvas.addEventListener("touchmove", (e) => {
        const result = handleTouchMove(
          e,
          isSelectMode,
          isResizing,
          selectedImage,
          setCurrentPosition
        );

        if (result && isSelectMode) {
          if (result.type === "resize") {
            handleResize(
              { offsetX: result.x, offsetY: result.y },
              isResizing,
              selectedImage,
              resizeHandle,
              setSelectedImage,
              setDragStart,
              dragStart
            );
          } else if (result.type === "drag") {
            handleImageDrag(
              { offsetX: result.x, offsetY: result.y },
              isSelectMode,
              selectedImage,
              isDraggingImage,
              setSelectedImage,
              setDragStart,
              dragStart
            );
          }
          drawSelectionIndicator(context.current, selectedImage);
        }
      });

      canvas.addEventListener("touchend", (e) => {
        const result = handleTouchEnd(
          e,
          isSelectMode,
          isResizing,
          setIsMouseDown,
          lastPoint,
          () =>
            saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo)
        );

        if (result && isSelectMode) {
          if (result.type === "resizeEnd") {
            handleResizeEnd(isResizing, setIsResizing, setResizeHandle, () =>
              saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo)
            );
          } else if (result.type === "dragEnd") {
            handleImageDragEnd(setIsDraggingImage, () =>
              saveCanvasState(canvasRef, canvasHistory, setCanUndo, setCanRedo)
            );
          }
          drawSelectionIndicator(context.current, selectedImage);
        }
      });

      return () => {
        window.removeEventListener("resize", updateCanvasSize);
        canvas.removeEventListener("mousedown", handleCanvasMouseDown);
        canvas.removeEventListener("mousemove", handleCanvasMouseMove);
        canvas.removeEventListener("mouseup", handleCanvasMouseUp);
        canvas.removeEventListener("drop", handleDrop);
        canvas.removeEventListener("dragover", handleDragOver);
        document.removeEventListener("paste", handlePaste);

        // Remove touch event listeners
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [canvasRef, gridCanvasRef, isEraser, brushWidth, brushColor, brushType]);

  useEffect(() => {
    if (gridCanvasRef.current && gridContext.current) {
      gridContext.current.clearRect(
        0,
        0,
        gridCanvasRef.current.width,
        gridCanvasRef.current.height
      );

      if (showGrid) {
        drawGridLines(gridContext);
      }
    }
  }, [showGrid]);

  useEffect(() => {
    if (isMouseDown && context.current && !isSelectMode) {
      setupContext();

      if (brushType === "pencil" && lastPoint.current) {
        // Draw line
        context.current.beginPath();
        context.current.moveTo(lastPoint.current.x, lastPoint.current.y);
        context.current.lineTo(currentPosition[0], currentPosition[1]);
        context.current.stroke();

        // Add pencil texture
        addNoise(
          context.current,
          currentPosition[0],
          currentPosition[1],
          brushWidth,
          brushColor
        );
      } else {
        context.current.lineTo(currentPosition[0], currentPosition[1]);
        context.current.stroke();
      }

      lastPoint.current = { x: currentPosition[0], y: currentPosition[1] };
      setColorUsed((prev) => prev + 1);
    }
  }, [currentPosition, isMouseDown]);

  // Initialize canvas history
  useEffect(() => {
    if (canvasRef.current) {
      canvasHistory.current.initialize(canvasRef.current);
      setCanUndo(canvasHistory.current.canUndo());
      setCanRedo(canvasHistory.current.canRedo());
    }
  }, [canvasRef]);

  // Redraw canvas with selection indicator
  useEffect(() => {
    if (context.current) {
      // Only redraw the selection indicator, not the entire canvas
      drawSelectionIndicator(context.current, selectedImage);
    }
  }, [selectedImage, isSelectMode]);

  return {
    isSelectMode,
    isEraser,
    brushWidth,
    brushType,
    brushColor,
    colorUsed,
    canUndo,
    canRedo,
    showGrid,
    handleSelectModeToggle: () =>
      handleSelectModeToggle(
        canvasRef,
        context,
        isSelectMode,
        setIsSelectMode,
        setIsEraser
      ),
    handleEraserToggle: () =>
      handleEraserToggle(isEraser, setIsEraser, setBrushType),
    handleBrushWidthChange: (e) => setBrushWidth(parseInt(e.target.value)),
    handleBrushTypeChange: (type) =>
      handleBrushTypeChange(type, setBrushType, setBrushWidth, setIsEraser),
    handleColorChange: (color, opacity) =>
      handleColorChange(color, opacity, setBrushColor, setBrushOpacity),
    handleUndo: () =>
      handleUndo(canvasRef, canvasHistory, setCanUndo, setCanRedo),
    handleRedo: () =>
      handleRedo(canvasRef, canvasHistory, setCanUndo, setCanRedo),
    handleGridToggle: () => setShowGrid(!showGrid),
    handleExport: () => {
      const link = document.createElement("a");
      link.download = "canvas.png";
      link.href = canvasRef.current.toDataURL();
      link.click();
    },
  };
}

export default useCanvasEventListeners;
