import React, { useEffect, useState } from "react";

function WarningDialog({ onAccept }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading assets...");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(false); // Add this state

  useEffect(() => {
    // Simplified loading - just simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15; // Random progress increments

      if (progress >= 100) {
        progress = 100;
        setLoadingProgress(100);
        setLoadingText("Loading complete!");
        setTimeout(() => {
          setIsLoaded(true);
          clearInterval(interval);
        }, 500);
      } else {
        setLoadingProgress(progress);
      }
    }, 200);

    // Fallback - force complete after 3 seconds
    const fallback = setTimeout(() => {
      setLoadingProgress(100);
      setLoadingText("Ready to play!");
      setIsLoaded(true);
      clearInterval(interval);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallback);
    };
  }, []);

  const handleFirstClick = () => {
    if (isLoaded) {
      setShowIntro(true); // Show intro instead of closing dialog
    }
  };

  const handleConfirmClick = () => {
    if (onAccept) {
      onAccept(); // This will start the game and spawn entity after 3 seconds
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 20000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: showIntro ? "600px" : "450px", // Wider for intro
          height: showIntro ? "400px" : "250px", // Taller for intro
          backgroundColor: "#c0c0c0",
          border: "2px outset #c0c0c0",
          fontFamily: "MS Sans Serif, sans-serif",
          fontSize: "11px",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            height: "20px",
            background: "linear-gradient(90deg, #0000ff 0%, #008080 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "2px 8px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          <span>BlockRooms</span>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: "20px",
            height: showIntro ? "380px" : "230px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {!showIntro ? (
            // Initial warning content
            <>
              <div
                style={{
                  fontSize: "15px",
                  marginBottom: "30px",
                  lineHeight: "1.4",
                }}
              >
                This is just a waitlist site and not the actual gameplay.
              </div>

              {/* Loading Section */}
              <div style={{ width: "100%", marginBottom: "30px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    marginBottom: "1px",
                    textAlign: "left",
                  }}
                >
                  {loadingText}
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "20px",
                    border: "2px inset #c0c0c0",
                    backgroundColor: "#ffffff",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${loadingProgress}%`,
                      background: "linear-gradient(90deg, #316AC5 0%, #52A6F5 50%, #316AC5 100%)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    marginTop: "1px",
                    textAlign: "right",
                    color: "#666",
                  }}
                >
                  {Math.round(loadingProgress)}%
                </div>
              </div>

              {/* OK Button */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={handleFirstClick}
                  style={{
                    width: "100px",
                    height: "30px",
                    backgroundColor: isLoaded ? "#c0c0c0" : "#d4d0c8",
                    border: isLoaded ? "3px outset #c0c0c0" : "2px inset #d4d0c8",
                    fontSize: "15px",
                    cursor: isLoaded ? "pointer" : "not-allowed",
                    fontFamily: "MS Sans Serif, sans-serif",
                    color: isLoaded ? "#000000" : "#808080",
                    opacity: isLoaded ? 1 : 0.6,
                  }}
                >
                  {isLoaded ? "Ok" : "Loading..."}
                </button>
              </div>
            </>
          ) : (
            // Game intro content
            <>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  color: "#000080",
                }}
              >
                🎮 Welcome to BlockRooms
              </div>

              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  marginBottom: "25px",
                  textAlign: "left",
                  maxWidth: "500px",
                }}
              >
                <div style={{ marginBottom: "1px" }}>
                  <strong>Objective:</strong> Survive as long as possible in the endless backrooms while being hunted by a mysterious entity.
                </div>
                
                <div style={{ marginBottom: "1px" }}>
                  <strong>Controls:</strong>
                  <br />• WASD or Arrow Keys - Move around
                  <br />• Mouse - Look around  
                  <br />• Left Click - Shoot
                  <br />• ESC - Unlock cursor
                </div>

                <div style={{ marginBottom: "1px" }}>
                  <strong>Warning:</strong> The entity will spawn shortly after you start. Listen carefully - the music gets louder as it approaches!
                </div>

                <div style={{ fontSize: "12px", fontStyle: "italic", color: "#666" }}>
                  This is a demo for waitlist purposes. The actual game will have more features.
                </div>
              </div>

              {/* Confirm Button */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={handleConfirmClick}
                  style={{
                    width: "120px",
                    height: "35px",
                    backgroundColor: "#c0c0c0",
                    border: "3px outset #c0c0c0",
                    fontSize: "15px",
                    cursor: "pointer",
                    fontFamily: "MS Sans Serif, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Start Game
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>  
  );
}

export default WarningDialog;