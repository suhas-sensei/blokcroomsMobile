import React, { useRef, useState, useEffect } from "react"; 
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { Vector3 } from "three";
import { Model } from "../src/Model";
import { Model as GunModel } from "../src/Gun1";

// Utility imports
import { isMobile } from "../src/utils/device";
import { requestFullscreen, lockOrientation, hideAddressBar } from "../src/utils/fullscreen";

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
  // State declarations
  const [playerPosition, setPlayerPosition] = useState(new Vector3(0, 1.6, 0));
  const [entityDistance, setEntityDistance] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showGun, setShowGun] = useState(true);
  const [bloodEffects, setBloodEffects] = useState([]);
  const [bulletHoles, setBulletHoles] = useState([]);
  const [showJoinPage, setShowJoinPage] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [entityActive, setEntityActive] = useState(false);
  const [mobileMovement, setMobileMovement] = useState({ x: 0, y: 0 });

  // Refs
  const entityRef = useRef();
  const shootFunctionRef = useRef(null);
  const mobile = isMobile();

  // Fullscreen and mobile optimization effect - MOBILE ONLY
  useEffect(() => {
    // Only apply fullscreen features on mobile devices
    if (!mobile) return;
    
    // Hide address bar and setup fullscreen for mobile
    hideAddressBar();
    
    // Try to lock orientation to landscape
    lockOrientation();
    
    // Request fullscreen on first user interaction
    const handleFirstTouch = () => {
      requestFullscreen();
      document.removeEventListener('touchstart', handleFirstTouch);
      document.removeEventListener('click', handleFirstTouch);
    };
    
    document.addEventListener('touchstart', handleFirstTouch);
    document.addEventListener('click', handleFirstTouch);
    
    return () => {
      document.removeEventListener('touchstart', handleFirstTouch);
      document.removeEventListener('click', handleFirstTouch);
    };
  }, [mobile]);

  // Event handlers
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
    
    // Request fullscreen and lock orientation when game starts - MOBILE ONLY
    if (mobile) {
      requestFullscreen();
      lockOrientation();
    }
    
    // Spawn entity after 3 seconds
    setTimeout(() => {
      setEntityActive(true);
    }, 3000);
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

  // Show join page if requested
  if (showJoinPage) {
    return <Join />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Single Warning Dialog */}
      {showWarning && <WarningDialog onAccept={handleWarningAccept} />}
      
      {/* Audio Manager - silent background component */}
      <AudioManager 
        entityDistance={entityDistance} 
        gameOver={gameOver} 
        onAudioStop={handleAudioStop} 
      />
      
      {/* Death Screen */}
      {gameOver && <DeathScreen onJoin={handleJoin} />}

      {/* Mobile Controls - only show when game is active */}
      {mobile && !gameOver && !showWarning && (
        <>
          <VirtualJoystick onJoystickMove={handleJoystickMove} isVisible={true} />
          <MobileShootButton onShoot={handleMobileShoot} isVisible={true} />
        </>
      )}

      {/* Game Instructions */}
      <Instructions gameOver={gameOver} />

      {/* Main 3D Canvas */}
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
        {/* Lighting */}
        <ambientLight intensity={0.4} color='#fff8dc' />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color='#fff8dc' castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} color='#f4e4bc' />

        {/* Controls */}
        {!mobile && <PointerLockControls />}
        {mobile && <MobileTouchControls gameOver={gameOver} />}
        
        {/* First Person Movement Controller */}
        <FirstPersonControls 
          onPositionUpdate={handlePositionUpdate} 
          gameOver={gameOver} 
          mobileMovement={mobileMovement} 
        />
        
        {/* 3D Models */}
        <Model />
        <Gun isVisible={showGun} onShoot={handleShootWithRef} />
        
        {/* Entity - only spawns when entityActive is true */}
        {entityActive && !gameOver && (
          <Entity 
            playerPosition={playerPosition} 
            onCatch={handleEntityCatch} 
            onDistanceUpdate={handleDistanceUpdate} 
          />
        )}

        {/* Visual Effects */}
        {bloodEffects.map(effect => (
          <BloodEffect 
            key={effect.id} 
            position={effect.position} 
            onComplete={() => removeBloodEffect(effect.id)} 
          />
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