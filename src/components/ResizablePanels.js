import React, { useState, useRef, useEffect } from "react";

function ResizablePanels({ left, right }) {
  const [leftWidth, setLeftWidth] = useState(30); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limit between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="resizable-container" ref={containerRef}>
      <div className="resizable-panel" style={{ width: `${leftWidth}%` }}>
        {left}
      </div>
      <div className={`divider ${isDragging ? "dragging" : ""}`} onMouseDown={handleMouseDown}>
        <div className="divider-handle"></div>
      </div>
      <div className="resizable-panel" style={{ width: `${100 - leftWidth}%` }}>
        {right}
      </div>
    </div>
  );
}

export default ResizablePanels;
