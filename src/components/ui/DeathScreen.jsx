// src/components/ui/DeathScreen.jsx
import React, { useEffect, useState } from "react";

function DeathScreen({ onJoin }) {
  const [showTV, setShowTV] = useState(false);
  const [showJoinText, setShowJoinText] = useState(false);

  useEffect(() => {
    // Automatically unlock cursor when death screen appears
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // Show TV image after 3 seconds
    const tvTimeout = setTimeout(() => {
      setShowTV(true);
    }, 3000);

    // Show join text after 6 seconds
    const joinTextTimeout = setTimeout(() => {
      setShowJoinText(true);
    }, 6000);

    return () => {
      clearTimeout(tvTimeout);
      clearTimeout(joinTextTimeout);
    };
  }, []);

  const handleClick = () => {
    if (showJoinText && onJoin) {
      onJoin();
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: showJoinText ? "pointer" : "default",
        overflow: "hidden",
      }}
    >
      {showTV && (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
          <img
            src='/tv2.png'
            alt='TV'
            style={{
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              display: "block",
            }}
          />
          {showJoinText && (
            <div
              style={{
                position: "absolute",
                bottom: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                fontSize: "24px",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                textAlign: "center",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                animation: "pulse 2s infinite",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              tap anywhere to join
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default DeathScreen;
