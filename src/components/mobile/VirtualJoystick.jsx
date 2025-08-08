import React, { useRef, useEffect, useState } from "react";

function VirtualJoystick({ onJoystickMove, isVisible }) {
  const [isDragging, setIsDragging] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [joystickVisible, setJoystickVisible] = useState(false);
  const [joystickCenter, setJoystickCenter] = useState({ x: 80, y: window.innerHeight - 80 });
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const activeTouch = useRef(null);

  const maxDistance = 50;
  const deadZone = 0.15;

  const handleStart = e => {
    const touch = e.touches ? e.touches[0] : e;
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Only activate if touch is on left side of screen AND no active joystick touch
    if (touchX > window.innerWidth / 2 || activeTouch.current !== null) return;

    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    setJoystickCenter({ x: touchX, y: touchY });
    setJoystickVisible(true);
    setIsDragging(true);
    activeTouch.current = e.touches ? e.touches[0].identifier : "mouse";
  };

  const handleMove = e => {
    if (!isDragging || activeTouch.current === null) return;

    // Find our specific touch
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
    // Check if our specific touch ended
    if (e.touches && activeTouch.current !== null) {
      const stillActive = Array.from(e.touches).find(t => t.identifier === activeTouch.current);
      if (stillActive) return; // Our touch is still active
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

    // Add move and end listeners only when dragging
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
  }, [isDragging, joystickCenter, activeTouch.current]);

  useEffect(() => {
    // Listen for touch starts only on left side
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

    // Use capture phase to get events first
    document.addEventListener("touchstart", handleTouchStart, { passive: false, capture: true });
    document.addEventListener("mousedown", handleMouseDown, { passive: false, capture: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, { capture: true });
      document.removeEventListener("mousedown", handleMouseDown, { capture: true });
    };
  }, [isVisible]);

  if (!isVisible || !joystickVisible) return null;

  return (
    <div
      ref={joystickRef}
      style={{
        position: "fixed",
        left: joystickCenter.x - maxDistance - 10,
        top: joystickCenter.y - maxDistance - 10,
        width: (maxDistance + 10) * 2,
        height: (maxDistance + 10) * 2,
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        zIndex: 1000,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        ref={knobRef}
        style={{
          position: "absolute",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "2px solid rgba(255, 255, 255, 1)",
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`,
          pointerEvents: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

export default VirtualJoystick;
