import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Raycaster } from "three";
import * as THREE from "three";
import { Model as GunModel } from "../../Gun1"; // Import the gun model
import { isMobile } from "../../utils/device";

function Gun({ isVisible = true, onShoot }) {
  const gunRef = useRef();
  const { camera, scene } = useThree();

  // Timer to drive breathing motion
  const swayTime = useRef(0);

  // Visual recoil state (doesn't block shooting)
  const [visualRecoil, setVisualRecoil] = useState(false);
  const recoilTime = useRef(0);
  const shootSound = useRef(null);

  // Load and apply textures
  useEffect(() => {
    // Load shoot sound
    const audio = new Audio("/shot.mp3");
    audio.volume = 0.7;
    shootSound.current = audio;

    if (gunRef.current) {
      const textureLoader = new THREE.TextureLoader();

      // Load beretta (gun) textures
      const berettaColor = textureLoader.load("/textures/berettaColor.png");
      const berettaNormal = textureLoader.load("/textures/berettaNormal.png");
      const berettaMetallic = textureLoader.load("/textures/berettaMetallic.png");
      const berettaRoughness = textureLoader.load("/textures/berettaRoughness.png");
      const berettaAO = textureLoader.load("/textures/berettaAO.png");

      // Load arms textures
      const armsColor = textureLoader.load("/textures/armsColor.png");
      const armsNormal = textureLoader.load("/textures/armsNormal.png");
      const armsRoughness = textureLoader.load("/textures/armsRoughness.png");
      const armsAO = textureLoader.load("/textures/armsAO.png");

      // Apply textures to materials
      gunRef.current.traverse(child => {
        if (child.isMesh && child.material) {
          const material = child.material;

          if (material.name === "beretta") {
            material.map = berettaColor;
            material.normalMap = berettaNormal;
            material.metalnessMap = berettaMetallic;
            material.roughnessMap = berettaRoughness;
            material.aoMap = berettaAO;
            material.metalness = 1.0;
            material.roughness = 0.4;
            material.aoMapIntensity = 1.0;
            child.castShadow = true;
            child.receiveShadow = true;
            material.needsUpdate = true;
          }

          if (material.name === "arms") {
            material.map = armsColor;
            material.normalMap = armsNormal;
            material.roughnessMap = armsRoughness;
            material.aoMap = armsAO;
            material.metalness = 0.0;
            material.roughness = 0.8;
            material.aoMapIntensity = 1.0;
            child.castShadow = true;
            child.receiveShadow = true;
            material.needsUpdate = true;
          }
        }
      });
    }

    // Add mouse click event listener for shooting (only for non-mobile)
    const handleMouseClick = event => {
      if (event.button === 0 && isVisible && !isMobile()) {
        shoot();
      }
    };

    if (!isMobile()) {
      document.addEventListener("mousedown", handleMouseClick);
    }

    return () => {
      if (!isMobile()) {
        document.removeEventListener("mousedown", handleMouseClick);
      }
      if (shootSound.current) {
        shootSound.current = null;
      }
    };
  }, [isVisible]);

  // Shoot function - can always shoot
  const shoot = () => {
    console.log("🔫 SHOOTING - No blocks, always fires!");

    // Play shoot sound (create new audio instance each time for rapid fire)
    if (shootSound.current) {
      try {
        // Clone the audio for rapid fire
        const shotAudio = shootSound.current.cloneNode();
        shotAudio.volume = 0.7;
        shotAudio.currentTime = 0;
        shotAudio.play().catch(error => {
          console.log("Failed to play shoot sound:", error);
        });
      } catch (error) {
        console.log("Audio clone failed, using original:", error);
        shootSound.current.currentTime = 0;
        shootSound.current.play().catch(err => {
          console.log("Original audio failed too:", err);
        });
      }
    }

    // Perform raycast from camera center
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);

    raycaster.set(camera.position, direction);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Filter out gun and non-solid objects
    const validIntersects = intersects.filter(intersect => {
      const object = intersect.object;
      return (
        !object.isLight &&
        !object.isCamera &&
        !gunRef.current?.children.some(child => child === object || child.children.includes(object)) &&
        (object.userData?.isEntity || (object.geometry && object.material)) &&
        object.visible
      );
    });

    if (validIntersects.length > 0 && onShoot?.shootHandler) {
      const hit = validIntersects[0];
      console.log("🎯 HIT DETECTED:", hit.object);
      onShoot.shootHandler(hit, camera.position);
    }

    // Start VISUAL recoil animation (doesn't block shooting)
    setVisualRecoil(true);
    recoilTime.current = 0;

    // End visual recoil quickly
    setTimeout(() => {
      setVisualRecoil(false);
    }, 80); // Very short visual recoil
  };

  // Expose shoot function to parent component
  useEffect(() => {
    if (onShoot && onShoot.setShootFunction) {
      console.log("🔗 Setting shoot function reference");
      onShoot.setShootFunction(shoot);
    }
  }, [onShoot]);

  useFrame((_, delta) => {
    if (!gunRef.current || !isVisible) return;

    // Increment sway timer
    swayTime.current += delta;

    // Breathing sway amount
    const swayY = Math.sin(swayTime.current * 2) * 0.01;

    // Base position from camera
    const gunPosition = new THREE.Vector3();
    camera.getWorldPosition(gunPosition);

    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    const down = new THREE.Vector3(0, -1, 0);

    forward.applyQuaternion(camera.quaternion);
    right.applyQuaternion(camera.quaternion);
    down.applyQuaternion(camera.quaternion);

    gunPosition.add(forward.multiplyScalar(0.5));
    gunPosition.add(right.multiplyScalar(0.3));
    gunPosition.add(down.multiplyScalar(0.2 + swayY));

    // Handle VISUAL recoil animation (doesn't affect shooting)
    let recoilOffset = new THREE.Vector3();
    let recoilRotation = { x: 0, y: 0, z: 0 };

    if (visualRecoil) {
      recoilTime.current += delta;
      const recoilDuration = 0.08; // Very quick visual recoil
      const recoilProgress = Math.min(recoilTime.current / recoilDuration, 1);
      const easedProgress = 1 - Math.pow(1 - recoilProgress, 3);

      const maxBackwardRecoil = 0.1;
      const maxUpwardRecoil = 0.05;
      const maxRotationRecoil = -0.2;

      const backwardRecoil = Math.sin(easedProgress * Math.PI) * maxBackwardRecoil;
      const upwardRecoil = Math.sin(easedProgress * Math.PI) * maxUpwardRecoil;
      const rotationRecoil = Math.sin(easedProgress * Math.PI) * maxRotationRecoil;

      recoilOffset.add(forward.clone().multiplyScalar(-backwardRecoil));
      recoilOffset.add(down.clone().multiplyScalar(-upwardRecoil));

      recoilRotation.x = -rotationRecoil;
      recoilRotation.z = (Math.random() - 0.5) * 0.05;
    }

    // Apply final position with recoil
    gunPosition.add(recoilOffset);
    gunRef.current.position.copy(gunPosition);

    // Apply rotation
    gunRef.current.quaternion.copy(camera.quaternion);
    gunRef.current.rotateX(0.1 + recoilRotation.x);
    gunRef.current.rotateY(Math.PI);
    gunRef.current.rotateZ(recoilRotation.z);
  });

  if (!isVisible) return null;

  return (
    <group ref={gunRef}>
      <pointLight position={[0.3, 0.2, 0.4]} intensity={1.5} distance={3} decay={1} color='#ffffff' />
      <pointLight position={[-0.2, -0.1, 0.3]} intensity={1.0} distance={2} decay={2} color='#fff8dc' />
      <GunModel scale={[1, 1, 1]} />
    </group>
  );
}

export default Gun;