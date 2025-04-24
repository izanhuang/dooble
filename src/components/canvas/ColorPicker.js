import { useState, useEffect, useRef } from "react";
import { floodFill } from "./floodFill";

function ColorPicker({ currentColor, onColorChange, onColorUsed }) {
  const [showPicker, setShowPicker] = useState(false);
  const [colorHistory, setColorHistory] = useState([]);
  const [color, setColor] = useState(currentColor);
  const [opacity, setOpacity] = useState(1);
  const [activeTab, setActiveTab] = useState("picker"); // picker, rgb, hex, wheel
  const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });
  const [pendingColor, setPendingColor] = useState(null);
  const [pendingOpacity, setPendingOpacity] = useState(null);
  const colorPreviewRef = useRef(null);

  // Convert any color format to hex
  const toHex = (color) => {
    if (color.startsWith("#")) return color;
    if (color.startsWith("rgb")) {
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        return `#${[r, g, b]
          .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("")}`;
      }
    }
    return color;
  };

  // Initialize color history with current color
  useEffect(() => {
    if (colorHistory.length === 0) {
      setColorHistory([{ color: toHex(currentColor), opacity }]);
    }
  }, []);

  // Update local color when currentColor changes
  useEffect(() => {
    setColor(toHex(currentColor));
  }, [currentColor]);

  // Update RGB values when color changes
  useEffect(() => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (result) {
      setRgb({
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      });
    }
  }, [color]);

  // When color is used in drawing, add it to history
  useEffect(() => {
    if (pendingColor !== null && pendingOpacity !== null) {
      const newColorEntry = {
        color: toHex(pendingColor),
        opacity: pendingOpacity,
      };
      const newHistory = [
        newColorEntry,
        ...colorHistory.filter(
          (entry) =>
            entry.color !== pendingColor || entry.opacity !== pendingOpacity
        ),
      ].slice(0, 10);
      setColorHistory(newHistory);
      setPendingColor(null);
      setPendingOpacity(null);
    }
  }, [onColorUsed]);

  const handleColorChange = (newColor) => {
    const hexColor = toHex(newColor);
    setColor(hexColor);
    setPendingColor(hexColor);
    setPendingOpacity(opacity);
    onColorChange(hexColor, opacity);
  };

  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value) / 100;
    setOpacity(newOpacity);
    // Create a new color with the updated opacity
    const newColor = color;
    setPendingColor(newColor);
    setPendingOpacity(newOpacity);
    onColorChange(newColor, newOpacity);
  };

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: parseInt(value) };
    setRgb(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(hex);
    setPendingColor(hex);
    setPendingOpacity(opacity);
    onColorChange(hex, opacity);
  };

  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const handleWheelClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const angle = Math.atan2(y - centerY, x - centerX);
    const distance = Math.min(
      Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)),
      rect.width / 2
    );

    const hue = ((angle * 180) / Math.PI + 180) % 360;
    const saturation = (distance / (rect.width / 2)) * 100;
    const lightness = 50;

    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const newColor = rgbToHex(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    );
    setColor(newColor);
    setPendingColor(newColor);
    setPendingOpacity(opacity);
    onColorChange(newColor, opacity);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", color);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          padding: "8px",
          backgroundColor: "white",
          color: "black",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          ref={colorPreviewRef}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: currentColor,
            border: "2px solid white",
            borderRadius: "4px",
            opacity: opacity,
            cursor: "grab",
          }}
        />
        <span>Color</span>
      </button>

      {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            width: "300px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              onClick={() => setActiveTab("picker")}
              style={{
                padding: "8px",
                backgroundColor: activeTab === "picker" ? "#2196F3" : "#f5f5f5",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Picker
            </button>
            <button
              onClick={() => setActiveTab("rgb")}
              style={{
                padding: "8px",
                backgroundColor: activeTab === "rgb" ? "#2196F3" : "#f5f5f5",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              RGB
            </button>
            <button
              onClick={() => setActiveTab("hex")}
              style={{
                padding: "8px",
                backgroundColor: activeTab === "hex" ? "#2196F3" : "#f5f5f5",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Hex
            </button>
            <button
              onClick={() => setActiveTab("wheel")}
              style={{
                padding: "8px",
                backgroundColor: activeTab === "wheel" ? "#2196F3" : "#f5f5f5",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Wheel
            </button>
          </div>

          {activeTab === "picker" && (
            <input
              type="color"
              value={toHex(color)}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{ width: "100%", height: "40px" }}
            />
          )}

          {activeTab === "rgb" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div>
                <label>Red</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange("r", e.target.value)}
                />
                <span>{rgb.r}</span>
              </div>
              <div>
                <label>Green</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange("g", e.target.value)}
                />
                <span>{rgb.g}</span>
              </div>
              <div>
                <label>Blue</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange("b", e.target.value)}
                />
                <span>{rgb.b}</span>
              </div>
            </div>
          )}

          {activeTab === "hex" && (
            <input
              type="text"
              value={toHex(color)}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          )}

          {activeTab === "wheel" && (
            <div
              style={{
                width: "200px",
                height: "200px",
                position: "relative",
                cursor: "pointer",
                background:
                  "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                borderRadius: "50%",
                transform: "rotate(-90deg)",
              }}
              onClick={handleWheelClick}
            />
          )}

          <div style={{ marginTop: "16px" }}>
            <label>Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={opacity * 100}
              onChange={handleOpacityChange}
              style={{ width: "100%" }}
            />
            <span>{Math.round(opacity * 100)}%</span>
          </div>

          <div style={{ marginTop: "16px" }}>
            <h4>Recent Colors</h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {colorHistory.map((entry, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setColor(toHex(entry.color));
                    setOpacity(entry.opacity);
                    onColorChange(toHex(entry.color), entry.opacity);
                  }}
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: toHex(entry.color),
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    opacity: entry.opacity,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
