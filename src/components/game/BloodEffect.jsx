import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

function BloodEffect({ position, onComplete }) {
  const bloodRef = useRef();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Load blood texture
    const textureLoader = new THREE.TextureLoader();
    const bloodTexture = textureLoader.load("/blood.png");

    if (bloodRef.current) {
      bloodRef.current.material.map = bloodTexture;
      bloodRef.current.material.transparent = true;
      bloodRef.current.material.needsUpdate = true;
    }

    // Fade out blood effect over 3 seconds
    const fadeInterval = setInterval(() => {
      setOpacity(prev => {
        const newOpacity = prev - 0.02;
        if (newOpacity <= 0) {
          clearInterval(fadeInterval);
          if (onComplete) onComplete();
          return 0;
        }
        return newOpacity;
      });
    }, 50);

    return () => clearInterval(fadeInterval);
  }, [onComplete]);

  useEffect(() => {
    if (bloodRef.current) {
      bloodRef.current.material.opacity = opacity;
    }
  }, [opacity]);

  return (
    <mesh ref={bloodRef} position={position}>
      <planeGeometry args={[0.3, 0.3]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}

export default BloodEffect;
