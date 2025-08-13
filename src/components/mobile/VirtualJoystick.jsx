import React, { useRef, useEffect, useState } from "react";

function VirtualJoystick({ onJoystickMove, isVisible }) {
  const [isDragging, setIsDragging] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [joystickVisible, setJoystickVisible] = useState(false);
  const [joystickCenter, setJoystickCenter] = useState({ x: 80, y: window.innerHeight - 80 });
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const activeTouch = useRef(null);

  const deadZone = 0.15;

  // Responsive sizing
  const getResponsiveSizes = () => {
    const minDimension = Math.min(screenSize.width, screenSize.height);
    
    // Base maxDistance on screen size, with limits
    let maxDistance = Math.max(25, Math.min(50, minDimension * 0.06));
    let knobSize = Math.max(18, Math.min(30, maxDistance * 0.6));
    
    // Additional adjustments for very small screens
    if (screenSize.width < 375) {
      maxDistance = Math.min(maxDistance, 35);
      knobSize = Math.min(knobSize, 22);
    }
    
    return { maxDistance, knobSize };
  };

  const { maxDistance, knobSize } = getResponsiveSizes();

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
    const touch = e.touches ? e.touches[0] : e;
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Only activate if touch is on left side of screen AND no active joystick touch
    if (touchX > window.innerWidth / 2 || activeTouch.current !== null) return;

    e.preventDefault();
    e.stopPropagation();

    setJoystickCenter({ x: touchX, y: touchY });
    setJoystickVisible(true);
    setIsDragging(true);
    activeTouch.current = e.touches ? e.touches[0].identifier : "mouse";
  };

  const handleMove = e => {
    if (!isDragging || activeTouch.current === null) return;

    const touch = e.touches ? Array.from(e.touches).find(t => t.identifier === activeTouch.current) : e;

    if (!touch) return;

    e.preventDefault();
    e.stopPropagation();

    const deltaX = touch.clientX - joystickCenter.x;
    const deltaY = touch.clientY - joystickCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;

    if (distance > maxDistance) {
      normalizedX = deltaX / distance;
      normalizedY = deltaY / distance;
    }

    const normalizedDistance = Math.min(distance / maxDistance, 1);
    if (normalizedDistance < deadZone) {
      normalizedX = 0;
      normalizedY = 0;
    } else {
      const scaledDistance = (normalizedDistance - deadZone) / (1 - deadZone);
      normalizedX *= scaledDistance;
      normalizedY *= scaledDistance;
    }

    setJoystickPosition({
      x: normalizedX * maxDistance,
      y: normalizedY * maxDistance,
    });

    if (onJoystickMove) {
      onJoystickMove({
        x: normalizedX,
        y: -normalizedY,
      });
    }
  };

  const handleEnd = e => {
    if (e.touches && activeTouch.current !== null) {
      const stillActive = Array.from(e.touches).find(t => t.identifier === activeTouch.current);
      if (stillActive) return;
    }

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    setJoystickVisible(false);
    setJoystickPosition({ x: 0, y: 0 });
    activeTouch.current = null;

    if (onJoystickMove) {
      onJoystickMove({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const moveOptions = { passive: false };
    const endOptions = { passive: false };

    document.addEventListener("touchmove", handleMove, moveOptions);
    document.addEventListener("touchend", handleEnd, endOptions);
    document.addEventListener("touchcancel", handleEnd, endOptions);
    document.addEventListener("mousemove", handleMove, moveOptions);
    document.addEventListener("mouseup", handleEnd, endOptions);

    return () => {
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };
  }, [isDragging, joystickCenter, activeTouch.current, maxDistance]);

  useEffect(() => {
    const handleTouchStart = e => {
      if (!isVisible) return;

      const touch = e.touches[0];
      if (touch.clientX <= window.innerWidth / 2) {
        handleStart(e);
      }
    };

    const handleMouseDown = e => {
      if (!isVisible) return;

      if (e.clientX <= window.innerWidth / 2) {
        handleStart(e);
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false, capture: true });
    document.addEventListener("mousedown", handleMouseDown, { passive: false, capture: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, { capture: true });
      document.removeEventListener("mousedown", handleMouseDown, { capture: true });
    };
  }, [isVisible, maxDistance]);

  if (!isVisible || !joystickVisible) return null;

  // Responsive padding
  const padding = Math.max(6, maxDistance * 0.2);

  return (
    <div
      ref={joystickRef}
      style={{
        position: "fixed",
        left: joystickCenter.x - maxDistance - padding,
        top: joystickCenter.y - maxDistance - padding,
        width: (maxDistance + padding) * 2,
        height: (maxDistance + padding) * 2,
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: `${Math.max(1, maxDistance * 0.04)}px solid rgba(255, 255, 255, 0.3)`,
        zIndex: 1000,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        ref={knobRef}
        style={{
          position: "absolute",
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: `${Math.max(1, knobSize * 0.07)}px solid rgba(255, 255, 255, 1)`,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`,
          pointerEvents: "none",
          boxShadow: `0 ${Math.max(1, knobSize * 0.08)}px ${Math.max(2, knobSize * 0.25)}px rgba(0,0,0,0.3)`,
        }}
      />
    </div>
  );
}

export default VirtualJoystick;