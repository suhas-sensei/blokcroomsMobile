// src/components/mobile/MobileTouchControls.jsx
import React, { useState, useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { isMobile } from "../../utils/device";

function MobileTouchControls({ gameOver }) {
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const sensitivity = 0.007;
  const activeTouch = useRef(null);

  // Define shoot button area to exclude
  const shootButtonArea = {
    right: 40,
    bottom: 40,
    width: 100,
    height: 100,
  };

  // Check if touch is in shoot button area
  const isTouchInShootButton = (touchX, touchY) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const buttonLeft = screenWidth - shootButtonArea.right - shootButtonArea.width;
    const buttonTop = screenHeight - shootButtonArea.bottom - shootButtonArea.height;
    const buttonRight = screenWidth - shootButtonArea.right;
    const buttonBottom = screenHeight - shootButtonArea.bottom;

    return touchX >= buttonLeft && touchX <= buttonRight && touchY >= buttonTop && touchY <= buttonBottom;
  };

  const handleTouchStart = e => {
    if (gameOver) return;

    // Find a touch on the right side that we're not already tracking
    let rightSideTouch = null;
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];

      // Check if touch is on right side AND not in shoot button area
      if (
        touch.clientX > window.innerWidth / 2 &&
        !isTouchInShootButton(touch.clientX, touch.clientY) &&
        (activeTouch.current === null || activeTouch.current !== touch.identifier)
      ) {
        rightSideTouch = touch;
        break;
      }
    }

    if (!rightSideTouch || activeTouch.current !== null) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    activeTouch.current = rightSideTouch.identifier;
    lastTouch.current = {
      x: rightSideTouch.clientX,
      y: rightSideTouch.clientY,
    };
  };

  const handleTouchMove = e => {
    if (!isDragging || activeTouch.current === null || gameOver) return;

    // Find our specific touch
    const touch = Array.from(e.touches).find(t => t.identifier === activeTouch.current);
    if (!touch) return;

    e.preventDefault();
    e.stopPropagation();

    const deltaX = touch.clientX - lastTouch.current.x;
    const deltaY = touch.clientY - lastTouch.current.y;

    // Store current rotations
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");

    // Apply rotations
    euler.y -= deltaX * sensitivity;
    euler.x -= deltaY * sensitivity;
    euler.z = 0; // Prevent tilting

    // Clamp vertical rotation
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

    // Apply back to camera
    camera.quaternion.setFromEuler(euler);

    lastTouch.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = e => {
    if (activeTouch.current === null) return;

    // Check if our specific touch ended
    const touchStillActive = Array.from(e.touches).find(t => t.identifier === activeTouch.current);
    if (touchStillActive) return; // Our touch is still active

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    activeTouch.current = null;
  };

  useEffect(() => {
    if (!isMobile() || gameOver) return;

    // Use capture phase to handle events before they bubble
    const options = { passive: false, capture: true };

    const startHandler = e => {
      // Only handle touches on right side that are NOT in shoot button area
      const hasValidRightSideTouch = Array.from(e.touches).some(
        touch => touch.clientX > window.innerWidth / 2 && !isTouchInShootButton(touch.clientX, touch.clientY)
      );

      if (hasValidRightSideTouch) {
        handleTouchStart(e);
      }
    };

    const moveHandler = e => {
      if (isDragging) {
        handleTouchMove(e);
      }
    };

    const endHandler = e => {
      if (isDragging) {
        handleTouchEnd(e);
      }
    };

    document.addEventListener("touchstart", startHandler, options);
    document.addEventListener("touchmove", moveHandler, options);
    document.addEventListener("touchend", endHandler, options);
    document.addEventListener("touchcancel", endHandler, options);

    return () => {
      document.removeEventListener("touchstart", startHandler, { capture: true });
      document.removeEventListener("touchmove", moveHandler, { capture: true });
      document.removeEventListener("touchend", endHandler, { capture: true });
      document.removeEventListener("touchcancel", endHandler, { capture: true });
    };
  }, [isDragging, gameOver, activeTouch.current]);

  return null;
}

export default MobileTouchControls;
