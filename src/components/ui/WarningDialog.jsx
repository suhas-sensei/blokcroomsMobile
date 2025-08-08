import React, { useEffect, useState } from "react";

function WarningDialog({ onAccept }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading assets...");
  const [isLoaded, setIsLoaded] = useState(false);

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

  const handleClick = () => {
    if (isLoaded && onAccept) {
      console.log("OK button clicked, calling onAccept");
      onAccept();
    } else {
      console.log("Button not ready:", { isLoaded, onAccept });
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
          width: "450px",
          height: "250px",
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
            height: "230px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
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
                marginBottom: "10px",
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
                marginTop: "5px",
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
              onClick={handleClick}
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
        </div>
      </div>
    </div>
  );
}

export default WarningDialog;
