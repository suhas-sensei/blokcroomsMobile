import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { Vector3 } from "three";
import { Model } from "../src/Model";
import { Model as GunModel } from "../src/Gun1";

// Utility imports
import { isMobile } from "../src/utils/device";

// UI components
import WarningDialog from "../src/components/ui/WarningDialog";
import DeathScreen from "../src/components/ui/DeathScreen";
import Join from "../src/components/ui/Join";

// Mobile components
import VirtualJoystick from "../src/components/mobile/VirtualJoystick";
import MobileTouchControls from "../src/components/mobile/MobileTouchControls";
import MobileShootButton from "../src/components/mobile/MobileShootButton";

// Game components
import Gun from "../src/components/game/Gun";
import Entity from "../src/components/game/Entity";
import BloodEffect from "../src/components/game/BloodEffect";
import BulletHole from "../src/components/game/BulletHole";
import AudioManager from "../src/components/game/AudioManager";
import FirstPersonControls from "../src/components/game/FirstPersonControls";
import Instructions from "../src/components/game/Instructions";

const App = () => {
  const [playerPosition, setPlayerPosition] = useState(new Vector3(0, 1.6, 0));
  const [entityDistance, setEntityDistance] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showGun, setShowGun] = useState(true);
  const [bloodEffects, setBloodEffects] = useState([]);
  const [bulletHoles, setBulletHoles] = useState([]);
  const [showJoinPage, setShowJoinPage] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [mobileMovement, setMobileMovement] = useState({ x: 0, y: 0 });

  const entityRef = useRef();
  const shootFunctionRef = useRef(null);
  const mobile = isMobile();

  const handleEntityCatch = () => {
    setGameOver(true);
  };

  const handleDistanceUpdate = distance => {
    setEntityDistance(distance);
  };

  const handlePositionUpdate = position => {
    setPlayerPosition(position);
  };

  const handleAudioStop = () => {
    console.log("All audio stopped, player is dead");
  };

  const handleJoin = () => {
    console.log("Redirecting to join page");
    setShowJoinPage(true);
  };

  const handleWarningAccept = () => {
    setShowWarning(false);
    setGameStarted(true);
  };

  const handleJoystickMove = movement => {
    setMobileMovement(movement);
  };

  const handleMobileShoot = () => {
    console.log("🎯 handleMobileShoot called");
    if (shootFunctionRef.current) {
      console.log("✅ Calling shoot function");
      shootFunctionRef.current();
    } else {
      console.log("❌ No shoot function reference available");
    }
  };

  if (showJoinPage) {
    return <Join />;
  }

  const handleShoot = (hit, cameraPosition) => {
    if (gameOver) return;

    const hitObject = hit.object;
    const hitPoint = hit.point;
    const hitNormal = hit.face.normal;

    if (hitObject.userData?.isEntity) {
      const bloodId = Date.now() + Math.random();
      setBloodEffects(prev => [
        ...prev,
        {
          id: bloodId,
          position: hitPoint.clone(),
        },
      ]);
    } else {
      const holeId = Date.now() + Math.random();
      const offsetPosition = hitPoint.clone().add(hitNormal.clone().multiplyScalar(0.01));
      setBulletHoles(prev => [
        ...prev,
        {
          id: holeId,
          position: offsetPosition,
          normal: hitNormal.clone(),
          cameraPosition: cameraPosition.clone(),
        },
      ]);
    }
  };

  const handleShootWithRef = {
    shootHandler: (hit, cameraPosition) => {
      handleShoot(hit, cameraPosition);
    },
    setShootFunction: shootFn => {
      shootFunctionRef.current = shootFn;
    },
  };

  const removeBloodEffect = id => {
    setBloodEffects(prev => prev.filter(effect => effect.id !== id));
  };

  const removeBulletHole = id => {
    setBulletHoles(prev => prev.filter(hole => hole.id !== id));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {showWarning && <WarningDialog onAccept={handleWarningAccept} />}
      <AudioManager entityDistance={entityDistance} gameOver={gameOver} onAudioStop={handleAudioStop} />
      {gameOver && <DeathScreen onJoin={handleJoin} />}

      {mobile && gameStarted && !gameOver && !showWarning && (
        <>
          <VirtualJoystick onJoystickMove={handleJoystickMove} isVisible={true} />
          <MobileShootButton onShoot={handleMobileShoot} isVisible={true} />
        </>
      )}

      <Instructions gameOver={gameOver} />

      <Canvas
        camera={{
          fov: 75,
          position: [0, 1.6, 0],
          rotation: [0, 0, 0],
          near: 0.1,
          far: 1000,
        }}
        onCreated={({ camera }) => {
          camera.rotation.set(0, 0, 0);
          camera.lookAt(0, 1.6, -1);
        }}
      >
        <ambientLight intensity={0.4} color='#fff8dc' />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color='#fff8dc' castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} color='#f4e4bc' />

        {!mobile && <PointerLockControls />}
        {mobile && <MobileTouchControls gameOver={gameOver} />}

        <FirstPersonControls onPositionUpdate={handlePositionUpdate} gameOver={gameOver} mobileMovement={mobileMovement} />
        <Model />
        <Gun isVisible={showGun} onShoot={handleShootWithRef} />

        {bloodEffects.map(effect => (
          <BloodEffect key={effect.id} position={effect.position} onComplete={() => removeBloodEffect(effect.id)} />
        ))}

        {bulletHoles.map(hole => (
          <BulletHole
            key={hole.id}
            position={hole.position}
            normal={hole.normal}
            cameraPosition={hole.cameraPosition}
            onComplete={() => removeBulletHole(hole.id)}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default App;
