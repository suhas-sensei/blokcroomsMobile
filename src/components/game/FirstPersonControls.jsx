import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";
import { isMobile } from "../../utils/device";

function FirstPersonControls({ onPositionUpdate, gameOver, mobileMovement }) {
  const { camera, scene } = useThree();
  const moveSpeed = 5;
  const playerRadius = 0.3; // Collision radius around player
  const baseHeight = 1.6; // Base camera height (eye level)
  const bobAmplitude = 0.08; // How much the camera bobs up and down
  const bobFrequency = 8; // How fast the bobbing occurs
  const bobTimeRef = useRef(0); // Track time for bobbing animation
  const isMovingRef = useRef(false); // Track if player is moving

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Handle keyboard input for desktop
  useEffect(() => {
    if (isMobile()) return; // Skip keyboard controls on mobile

    const handleKeyDown = event => {
      if (gameOver) return; // Disable movement when game is over

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = event => {
      if (gameOver) return; // Disable movement when game is over

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver]);

  // Handle mobile movement
  useEffect(() => {
    if (!isMobile() || !mobileMovement) return;

    // Convert joystick input to movement keys (more sensitive)
    keys.current.forward = mobileMovement.y > 0.1;
    keys.current.backward = mobileMovement.y < -0.1;
    keys.current.left = mobileMovement.x < -0.1;
    keys.current.right = mobileMovement.x > 0.1;
  }, [mobileMovement]);

  // Check for collisions using raycasting
  const checkCollision = newPosition => {
    const raycaster = new THREE.Raycaster();
    const directions = [
      new Vector3(1, 0, 0), // right
      new Vector3(-1, 0, 0), // left
      new Vector3(0, 0, 1), // forward
      new Vector3(0, 0, -1), // backward
      new Vector3(0.707, 0, 0.707), // diagonal
      new Vector3(-0.707, 0, 0.707), // diagonal
      new Vector3(0.707, 0, -0.707), // diagonal
      new Vector3(-0.707, 0, -0.707), // diagonal
    ];

    // Check collision in multiple directions around the player
    for (const direction of directions) {
      raycaster.set(newPosition, direction);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Filter out non-solid objects (lights, cameras, etc.)
      const solidIntersects = intersects.filter(intersect => {
        const object = intersect.object;
        // Check if object has geometry and is likely a wall/floor
        return object.geometry && object.material && !object.isLight && !object.isCamera && object.visible;
      });

      if (solidIntersects.length > 0 && solidIntersects[0].distance < playerRadius) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  // Update camera position based on input with collision detection and running animation
  useFrame((state, delta) => {
    if (gameOver) return; // Stop movement when game is over

    const velocity = new Vector3();
    const direction = new Vector3();

    camera.getWorldDirection(direction);
    direction.y = 0; // Keep movement horizontal
    direction.normalize();

    const right = new Vector3();
    right.crossVectors(direction, camera.up).normalize();

    if (keys.current.forward) velocity.add(direction);
    if (keys.current.backward) velocity.sub(direction);
    if (keys.current.right) velocity.add(right);
    if (keys.current.left) velocity.sub(right);

    // Check if player is moving
    const isMoving = velocity.length() > 0;
    isMovingRef.current = isMoving;

    if (isMoving) {
      velocity.normalize();
      velocity.multiplyScalar(moveSpeed * delta);

      // Calculate new position
      const newPosition = camera.position.clone().add(velocity);

      // Check for collision before moving
      if (!checkCollision(newPosition)) {
        camera.position.copy(newPosition);
      } else {
        // Try moving in individual axes if diagonal movement is blocked
        const xMovement = new Vector3(velocity.x, 0, 0);
        const zMovement = new Vector3(0, 0, velocity.z);

        const xPosition = camera.position.clone().add(xMovement);
        const zPosition = camera.position.clone().add(zMovement);

        if (!checkCollision(xPosition)) {
          camera.position.add(xMovement);
        } else if (!checkCollision(zPosition)) {
          camera.position.add(zMovement);
        }
        // If both individual axes are blocked, don't move
      }
    }

    // Handle running animation (head bob)
    if (isMovingRef.current) {
      // Increment bob time when moving
      bobTimeRef.current += delta * bobFrequency;

      // Calculate bobbing offset using sine wave
      const bobOffset = Math.sin(bobTimeRef.current) * bobAmplitude;

      // Apply bobbing to camera Y position
      camera.position.y = baseHeight + bobOffset;
    } else {
      // When not moving, gradually return to base height
      const currentHeight = camera.position.y;
      const heightDiff = baseHeight - currentHeight;

      // Smooth interpolation back to base height
      if (Math.abs(heightDiff) > 0.001) {
        camera.position.y += heightDiff * delta * 5; // Smooth return
      } else {
        camera.position.y = baseHeight;
      }

      // Reset bob time when not moving
      bobTimeRef.current = 0;
    }

    // Update player position for entity tracking
    if (onPositionUpdate) {
      onPositionUpdate(camera.position.clone());
    }
  });

  return null;
}

export default FirstPersonControls;
