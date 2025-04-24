import { useEffect, useRef, useState } from "react";
import { drawGridLines } from "../../helpers/grid";
import ColorPicker from "./ColorPicker";
import { CanvasHistory } from "./canvasHistory";
import { floodFill } from "./floodFill";

function CanvasEventListeners({ showGrid, canvasRef, gridCanvasRef }) {
  const [isMouseDown, setIsMouseDown] = useState(null);
  const [currentPosition, setCurrentPosition] = useState([-1, -1]);
  const [isEraser, setIsEraser] = useState(false);
  const [brushWidth, setBrushWidth] = useState(8);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [colorUsed, setColorUsed] = useState(0);
  const [brushType, setBrushType] = useState("pen");
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

  // Brush size presets
  const brushSizePresets = {
    pencil: 4,
    pen: 8,
    marker: 12,
  };

  // Handle brush type change
  const handleBrushTypeChange = (type) => {
    setBrushType(type);
    setBrushWidth(brushSizePresets[type]);
  };

  // Convert hex color to RGBA
  const hexToRgba = (hex, opacity) => {
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

  // Add noise to create pencil effect
  const addNoise = (ctx, x, y, width, color) => {
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

  const handleColorChange = (color, opacity) => {
    const newColor = hexToRgba(color, opacity);
    setBrushColor(newColor);
    setBrushOpacity(opacity);
  };

  // Set up drawing context based on brush type
  const setupContext = () => {
    if (context.current) {
      context.current.lineWidth = brushWidth;
      context.current.lineCap = "round";
      context.current.lineJoin = "round";

      if (isEraser) {
        // Use destination-out to properly erase
        context.current.globalCompositeOperation = "destination-out";
        context.current.strokeStyle = "rgba(0, 0, 0, 1)"; // Any color works since we're using destination-out
      } else {
        context.current.globalCompositeOperation = "source-over";
        context.current.strokeStyle = brushColor;

        switch (brushType) {
          case "pencil":
            context.current.lineWidth = Math.max(1, brushWidth * 0.35);
            break;
          case "marker":
            context.current.globalCompositeOperation = "multiply";
            context.current.lineWidth = brushWidth * 1.2;
            // Make marker more transparent
            const markerColor = brushColor.replace(/[\d.]+\)$/, "0.3)");
            context.current.strokeStyle = markerColor;
            break;
          case "pen":
          default:
            context.current.lineWidth = brushWidth;
            break;
        }
      }
    }
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
      saveCanvasState();
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
            saveCanvasState();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle image selection
  const handleImageSelect = (x, y) => {
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
    const imageData = context.current.getImageData(x, y, 1, 1).data;
    if (imageData[3] > 0) {
      // If pixel is not transparent
      // Get the image dimensions by scanning the canvas
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;

      // Scan horizontally
      for (let i = x; i >= 0; i--) {
        const pixel = context.current.getImageData(i, y, 1, 1).data;
        if (pixel[3] === 0) break;
        minX = i;
      }
      for (let i = x; i < canvasRef.current.width; i++) {
        const pixel = context.current.getImageData(i, y, 1, 1).data;
        if (pixel[3] === 0) break;
        maxX = i;
      }

      // Scan vertically
      for (let i = y; i >= 0; i--) {
        const pixel = context.current.getImageData(x, i, 1, 1).data;
        if (pixel[3] === 0) break;
        minY = i;
      }
      for (let i = y; i < canvasRef.current.height; i++) {
        const pixel = context.current.getImageData(x, i, 1, 1).data;
        if (pixel[3] === 0) break;
        maxY = i;
      }

      // Store the original image data
      const imageData = context.current.getImageData(
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

  // Handle image drag start
  const handleImageDragStart = (e) => {
    if (!isSelectMode || !selectedImage) return;
    setIsDraggingImage(true);
    setDragStart({ x: e.offsetX, y: e.offsetY });
  };

  // Handle image drag
  const handleImageDrag = (e) => {
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

  // Handle image drag end
  const handleImageDragEnd = () => {
    setIsDraggingImage(false);
    saveCanvasState();
  };

  // Handle resize start
  const handleResizeStart = (e, handle) => {
    if (!isSelectMode || !selectedImage) return;
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.offsetX, y: e.offsetY });
  };

  // Handle resize
  const handleResize = (e) => {
    if (!isResizing || !selectedImage || !resizeHandle) return;

    const dx = e.offsetX - dragStart.x;
    const dy = e.offsetY - dragStart.y;

    let newX = selectedImage.x;
    let newY = selectedImage.y;
    let newWidth = selectedImage.width;
    let newHeight = selectedImage.height;

    switch (resizeHandle) {
      case "nw":
        newX += dx;
        newY += dy;
        newWidth -= dx;
        newHeight -= dy;
        break;
      case "n":
        newY += dy;
        newHeight -= dy;
        break;
      case "ne":
        newY += dy;
        newWidth += dx;
        newHeight -= dy;
        break;
      case "w":
        newX += dx;
        newWidth -= dx;
        break;
      case "e":
        newWidth += dx;
        break;
      case "sw":
        newX += dx;
        newWidth -= dx;
        newHeight += dy;
        break;
      case "s":
        newHeight += dy;
        break;
      case "se":
        newWidth += dx;
        newHeight += dy;
        break;
    }

    // Ensure minimum size
    if (newWidth < 10) newWidth = 10;
    if (newHeight < 10) newHeight = 10;

    setSelectedImage({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });

    setDragStart({ x: e.offsetX, y: e.offsetY });
  };

  // Handle resize end
  const handleResizeEnd = () => {
    if (!isResizing) return;
    setIsResizing(false);
    setResizeHandle(null);
    saveCanvasState();
  };

  // Draw selection indicator with resize handles
  const drawSelectionIndicator = () => {
    if (!selectedImage || !context.current) return;

    // Save the current canvas state
    context.current.save();

    // Draw selection rectangle
    context.current.strokeStyle = "#2196F3";
    context.current.lineWidth = 2;
    context.current.setLineDash([5, 5]);
    context.current.strokeRect(
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
      context.current.fillStyle = "#2196F3";
      context.current.fillRect(handle.x, handle.y, handleSize, handleSize);
    });

    // Restore the canvas state
    context.current.restore();
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
      canvas.addEventListener("mousedown", handleCanvasMouseDown);
      canvas.addEventListener("mousemove", handleCanvasMouseMove);
      canvas.addEventListener("mouseup", handleCanvasMouseUp);
      canvas.addEventListener("drop", handleDrop);
      canvas.addEventListener("dragover", handleDragOver);
      document.addEventListener("paste", handlePaste);

      return () => {
        window.removeEventListener("resize", updateCanvasSize);
        canvas.removeEventListener("mousedown", handleCanvasMouseDown);
        canvas.removeEventListener("mousemove", handleCanvasMouseMove);
        canvas.removeEventListener("mouseup", handleCanvasMouseUp);
        canvas.removeEventListener("drop", handleDrop);
        canvas.removeEventListener("dragover", handleDragOver);
        document.removeEventListener("paste", handlePaste);
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
      drawSelectionIndicator();
    }
  }, [selectedImage, isSelectMode]);

  // Update mouse event handlers
  function handleCanvasMouseDown(event) {
    event.preventDefault();
    if (isSelectMode) {
      const x = event.offsetX;
      const y = event.offsetY;

      // Check if clicking on a resize handle
      if (selectedImage) {
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

        const clickedHandle = handles.find(
          (handle) =>
            x >= handle.x &&
            x <= handle.x + handleSize &&
            y >= handle.y &&
            y <= handle.y + handleSize
        );

        if (clickedHandle) {
          handleResizeStart(event, clickedHandle.type);
          return;
        }
      }

      handleImageSelect(x, y);
      handleImageDragStart(event);
    } else if (context.current) {
      setIsMouseDown(true);
      setupContext();
      context.current.beginPath();
      context.current.moveTo(event.offsetX, event.offsetY);
      lastPoint.current = { x: event.offsetX, y: event.offsetY };
    }
  }

  function handleCanvasMouseMove(event) {
    event.preventDefault();
    if (isSelectMode) {
      if (isResizing) {
        handleResize(event);
      } else {
        handleImageDrag(event);
      }
      drawSelectionIndicator();
    } else {
      setCurrentPosition([event.offsetX, event.offsetY]);
    }
  }

  function handleCanvasMouseUp(event) {
    event.preventDefault();
    if (isSelectMode) {
      if (isResizing) {
        handleResizeEnd();
      } else {
        handleImageDragEnd();
      }
      drawSelectionIndicator();
    } else {
      setIsMouseDown(false);
      lastPoint.current = null;
      saveCanvasState();
    }
  }

  // Save canvas state
  const saveCanvasState = () => {
    if (canvasRef.current) {
      canvasHistory.current.saveState(canvasRef.current);
      setCanUndo(canvasHistory.current.canUndo());
      setCanRedo(canvasHistory.current.canRedo());
    }
  };

  // Handle undo
  const handleUndo = () => {
    if (canvasRef.current && canvasHistory.current.undo(canvasRef.current)) {
      setCanUndo(canvasHistory.current.canUndo());
      setCanRedo(canvasHistory.current.canRedo());
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (canvasRef.current && canvasHistory.current.redo(canvasRef.current)) {
      setCanUndo(canvasHistory.current.canUndo());
      setCanRedo(canvasHistory.current.canRedo());
    }
  };

  // Handle select mode toggle
  const handleSelectModeToggle = () => {
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

  // Redraw the canvas content
  const redrawCanvas = () => {
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

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          flex: "1",
          minWidth: "200px",
        }}
      >
        <button
          onClick={handleSelectModeToggle}
          style={{
            padding: "8px 16px",
            backgroundColor: isSelectMode ? "#2196F3" : "#f5f5f5",
            color: isSelectMode ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isSelectMode ? "Exit Select Mode" : "Select Mode"}
        </button>
        <button
          onClick={() => setIsEraser(!isEraser)}
          disabled={isSelectMode}
          style={{
            padding: "8px",
            backgroundColor: isEraser ? "#2196F3" : "#f5f5f5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isSelectMode ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            opacity: isSelectMode ? 0.5 : 1,
          }}
        >
          <img
            src="/icons/eraser.png"
            style={{ width: "24px", height: "24px" }}
            alt="Eraser"
          />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            minWidth: "150px",
            opacity: isSelectMode ? 0.5 : 1,
          }}
        >
          <span style={{ minWidth: "40px" }}>{brushWidth}px</span>
          <input
            type="range"
            min="1"
            max="50"
            value={brushWidth}
            onChange={(e) => setBrushWidth(parseInt(e.target.value))}
            style={{ width: "100px" }}
            disabled={isSelectMode}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            backgroundColor: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            flexWrap: "wrap",
            opacity: isSelectMode ? 0.5 : 1,
          }}
        >
          <button
            onClick={() => handleBrushTypeChange("pencil")}
            disabled={isSelectMode}
            style={{
              padding: "8px",
              backgroundColor: brushType === "pencil" ? "#2196F3" : "#f5f5f5",
              color: brushType === "pencil" ? "white" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: isSelectMode ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/pencil.png"
              style={{ width: "24px", height: "24px" }}
              alt="Pencil"
            />
          </button>
          <button
            onClick={() => handleBrushTypeChange("pen")}
            disabled={isSelectMode}
            style={{
              padding: "8px",
              backgroundColor: brushType === "pen" ? "#2196F3" : "#f5f5f5",
              color: brushType === "pen" ? "white" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: isSelectMode ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/pen.png"
              style={{ width: "24px", height: "24px" }}
              alt="Pen"
            />
          </button>
          <button
            onClick={() => handleBrushTypeChange("marker")}
            disabled={isSelectMode}
            style={{
              padding: "8px",
              backgroundColor: brushType === "marker" ? "#2196F3" : "#f5f5f5",
              color: brushType === "marker" ? "white" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: isSelectMode ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/marker.png"
              style={{ width: "24px", height: "24px" }}
              alt="Marker"
            />
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <ColorPicker
          currentColor={brushColor}
          onColorChange={handleColorChange}
          onColorUsed={colorUsed}
          disabled={isSelectMode}
        />
        <div
          style={{
            display: "flex",
            gap: "8px",
            backgroundColor: "white",
            padding: "8px 16px",
            borderRadius: "4px",
          }}
        >
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            style={{
              padding: "8px",
              backgroundColor: "#f5f5f5",
              border: "none",
              borderRadius: "4px",
              cursor: canUndo ? "pointer" : "not-allowed",
              opacity: canUndo ? 1 : 0.15,
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/undo.png"
              style={{ width: "24px", height: "24px" }}
              alt="Undo"
            />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            style={{
              padding: "8px",
              backgroundColor: "#f5f5f5",
              border: "none",
              borderRadius: "4px",
              cursor: canRedo ? "pointer" : "not-allowed",
              opacity: canRedo ? 1 : 0.15,
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/icons/redo.png"
              style={{ width: "24px", height: "24px" }}
              alt="Redo"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanvasEventListeners;
