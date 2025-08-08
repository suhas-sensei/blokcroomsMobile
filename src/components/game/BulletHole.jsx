import React, { useRef, useEffect } from "react";
import * as THREE from "three";

function BulletHole({ position, normal, cameraPosition, onComplete }) {
  const holeRef = useRef();

  useEffect(() => {
    // Load hole texture
    const textureLoader = new THREE.TextureLoader();
    const holeTexture = textureLoader.load("/hole.png");

    if (holeRef.current) {
      holeRef.current.material.map = holeTexture;
      holeRef.current.material.transparent = true;
      holeRef.current.material.needsUpdate = true;

      // Orient the hole to face towards the camera (player)
      holeRef.current.lookAt(cameraPosition);
    }

    // Remove bullet hole after 10 seconds
    const removeTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 10000);

    return () => clearTimeout(removeTimeout);
  }, [position, normal, cameraPosition, onComplete]);

  return (
    <mesh ref={holeRef} position={position}>
      <planeGeometry args={[0.15, 0.15]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}

export default BulletHole;
