import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";

function Entity({ playerPosition, onCatch, onDistanceUpdate }) {
  const entityRef = useRef();
  const entitySpeed = 2.5; // Slightly slower than player for tension
  const catchDistance = 1.2; // Distance at which entity catches player

  useEffect(() => {
    // Load entity texture
    const textureLoader = new THREE.TextureLoader();
    const entityTexture = textureLoader.load("/good.png");

    if (entityRef.current) {
      // Apply texture to entity material
      entityRef.current.material.map = entityTexture;
      entityRef.current.material.transparent = true;
      entityRef.current.material.needsUpdate = true;
      // Mark this as an entity for shooting detection
      entityRef.current.userData = { isEntity: true };
    }
  }, []);

  useFrame((state, delta) => {
    if (!entityRef.current || !playerPosition) return;

    const entityPosition = entityRef.current.position;

    // Calculate direction to player
    const direction = new Vector3().subVectors(playerPosition, entityPosition).normalize();

    // Move entity towards player
    const movement = direction.multiplyScalar(entitySpeed * delta);
    entityRef.current.position.add(movement);

    // Make entity always face the player
    entityRef.current.lookAt(playerPosition);

    // Calculate distance to player and update audio
    const distanceToPlayer = entityPosition.distanceTo(playerPosition);
    if (onDistanceUpdate) {
      onDistanceUpdate(distanceToPlayer);
    }

    // Check if entity caught the player
    if (distanceToPlayer < catchDistance) {
      onCatch();
    }
  });

  return (
    <mesh ref={entityRef} position={[10, 1.5, 10]}>
      <planeGeometry args={[3, 2]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}

export default Entity;
