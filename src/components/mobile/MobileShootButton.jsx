import React, { useState } from "react";
import gunImage from "/shott.png";

function MobileShootButton({ onShoot, isVisible }) {
  const [isPressed, setIsPressed] = useState(false);

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

  return (
    <div
      style={{
        position: "fixed",
        bottom: "40px",
        right: "40px",
        width: "90px",
        height: "90px",
        borderRadius: "50%",
        backgroundColor: isPressed ? "#d8ca05ff" : "#ddd",
        border: "3px solid #fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        touchAction: "none",
        userSelect: "none",
        transform: isPressed ? "scale(0.9)" : "scale(1)",
        transition: "all 0.05s ease",
        boxShadow: isPressed
          ? "0 0 16px rgba(255, 215, 0, 0.8)" // yellow glow
          : "0 4px 12px rgba(0,0,0,0.3)",
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
          width: "70%",
          height: "70%",
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
