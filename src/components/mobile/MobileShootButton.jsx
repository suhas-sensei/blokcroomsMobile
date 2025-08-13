import React, { useState, useEffect } from "react";
import gunImage from "/shott.png";

function MobileShootButton({ onShoot, isVisible }) {
  const [isPressed, setIsPressed] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStart = e => {
    e.preventDefault();
    e.stopPropagation();

    console.log("📱 Mobile shoot button pressed");
    setIsPressed(true);

    if (onShoot) {
      onShoot();
    } else {
      console.log("❌ No onShoot function");
    }
  };

  const handleEnd = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsPressed(false);
    console.log("📱 Mobile shoot button released");
  };

  if (!isVisible) return null;

  // Responsive sizing based on screen dimensions
  const getResponsiveSize = () => {
    const minDimension = Math.min(screenSize.width, screenSize.height);
    
    // Base size on smaller screen dimension, with limits
    let size = Math.max(40, Math.min(70, minDimension * 0.2));
    
    // Additional adjustments for very small screens
    if (screenSize.width < 375) {
      size = Math.min(size, 60);
    }
    
    return size;
  };

  const size = getResponsiveSize();
  const imageSize = "65%";

  // Responsive positioning
  const getPosition = () => {
    const padding = Math.max(10, size * 0.3);
    return {
      bottom: `${padding}px`,
      right: `${padding}px`,
    };
  };

  const position = getPosition();

  return (
    <div
      style={{
        position: "fixed",
        ...position,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: isPressed ? "#d8ca05ff" : "#ddd",
        border: `${Math.max(2, size * 0.04)}px solid #fff`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        touchAction: "none",
        userSelect: "none",
        transform: isPressed ? "scale(0.9)" : "scale(1)",
        transition: "all 0.05s ease",
        boxShadow: isPressed
          ? "0 0 16px rgba(255, 215, 0, 0.8)"
          : `0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,0.3)`,
        cursor: "pointer",
      }}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <img
        src={gunImage}
        alt='Shoot'
        style={{
          width: imageSize,
          height: imageSize,
          objectFit: "contain",
          pointerEvents: "none",
          filter: "brightness(0) invert(1)",
          rotate: "20deg",
        }}
      />
    </div>
  );
}

export default MobileShootButton;