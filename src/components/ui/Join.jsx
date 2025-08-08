import React, { useRef, useEffect, useState } from "react";

function Join() {
  const [username, setUsername] = useState("");
  const [showLinks, setShowLinks] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !inputDisabled) {
      inputRef.current.focus();
    }
  }, [inputDisabled]);

  // Function to send data to SheetDB
  const submitToSheetDB = async username => {
    try {
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      // Generate serial number (timestamp-based to ensure uniqueness)
      const serialNumber = Date.now();

      const dataToSend = {
        data: [
          {
            "sl.no": serialNumber,
            "username": String(username),
            "time": formattedTime,
          },
        ],
      };

      console.log("Sending this data to SheetDB:", dataToSend);

      const response = await fetch("https://sheetdb.io/api/v1/e3qzzdsccl9j2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Data saved successfully to SheetDB:", result);
        setSubmitStatus("✅ Successfully added to waitlist!");
        return true;
      } else {
        const errorData = await response.text();
        console.error("Error saving data. Status:", response.status, "Response:", errorData);
        setSubmitStatus("❌ Error adding to waitlist. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      setSubmitStatus("❌ Network error. Please check your connection.");
      return false;
    }
  };

  const handleKeyPress = async e => {
    if (e.key === "Enter" && username.trim() && !isSubmitting) {
      setIsSubmitting(true);
      setInputDisabled(true);
      setShowCursor(false);
      setSubmitStatus("⏳ Adding to waitlist...");

      // Submit to SheetDB
      const success = await submitToSheetDB(username.trim());

      if (success) {
        // Show links after successful submission
        setTimeout(() => {
          setShowLinks(true);
        }, 1000);
      } else {
        // Re-enable input on error
        setInputDisabled(false);
        setShowCursor(true);
      }

      setIsSubmitting(false);
    }
  };

  const handleFocus = () => {
    setShowCursor(false);
  };

  const handleBlur = () => {
    if (!inputDisabled) {
      setShowCursor(true);
    }
  };

  const handleClick = () => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className='terminal'
      onClick={handleClick}
      style={{
        width: "100%",
        height: "100vh",
        padding: "20px",
        backgroundColor: "#000",
        color: "#00ff00",
        fontFamily: "'Jersey 15', monospace",
        fontSize: "30px",
        lineHeight: "1.4",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Jersey+15&display=swap');

          body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .terminal {
            overflow-y: auto;
          }

          .cursor {
            display: inline-block;
            width: 8px;
            height: 16px;
            background-color: #00ff00;
            animation: blink 1s infinite;
          }

          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }

          .terminal-input {
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'Jersey 15', monospace;
            font-size: 30px;
            outline: none;
            flex: 1;
          }

          .links a {
            color: #00ff00;
            text-decoration: underline;
          }

          .links a:hover {
            color: #00ffff;
          }

          .status-message {
            font-size: 20px;
            margin-top: 10px;
            opacity: 0.8;
          }

          .success-message {
            color: #00ff00;
          }

          .error-message {
            color: #ff6b6b;
          }

          .loading-message {
            color: #ffff00;
          }
        `}
      </style>

      <div style={{ marginBottom: "20px", whiteSpace: "pre" }}>
        {`██████╗░██╗░░░░░░█████╗░░█████╗░██╗░░██╗██████╗░░█████╗░░█████╗░███╗░░░███╗░██████╗
██╔══██╗██║░░░░░██╔══██╗██╔══██╗██║░██╔╝██╔══██╗██╔══██╗██╔══██╗████╗░████║██╔════╝
██████╦╝██║░░░░░██║░░██║██║░░╚═╝█████═╝░██████╔╝██║░░██║██║░░██║██╔████╔██║╚█████╗░
██╔══██╗██║░░░░░██║░░██║██║░░██╗██╔═██╗░██╔══██╗██║░░██║██║░░██║██║╚██╔╝██║░╚═══██╗
██████╦╝███████╗╚█████╔╝╚█████╔╝██║░╚██╗██║░░██║╚█████╔╝╚█████╔╝██║░╚═╝░██║██████╔╝
╚═════╝░╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░░░░╚═╝╚═════╝░`}
      </div>

      <div style={{ marginTop: "30px" }}>
        <div>Enter your Discord Username to join the waitlist</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "5px" }}>{">"}</span>
          <input
            ref={inputRef}
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={inputDisabled}
            className='terminal-input'
            autoComplete='off'
            placeholder={inputDisabled ? "" : "your_discord_username"}
          />
          {showCursor && <span className='cursor'></span>}
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div
            className={`status-message ${
              submitStatus.includes("✅") ? "success-message" : submitStatus.includes("❌") ? "error-message" : "loading-message"
            }`}
          >
            {submitStatus}
          </div>
        )}

        {showLinks && (
          <div className='links' style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "10px", fontSize: "24px" }}>Welcome to the waitlist! Join our community:</div>
            <div>
              Twitter:{" "}
              <a href='https://x.com/_BlockRooms' target='_blank' rel='noopener noreferrer'>
                https://x.com/_BlockRooms
              </a>
            </div>
            <div>
              Discord:{" "}
              <a href='https://discord.com/invite/jcpgh3KS3z' target='_blank' rel='noopener noreferrer'>
                https://discord.com/invite/jcpgh3KS3z
              </a>
            </div>
            <div style={{ marginTop: "15px", fontSize: "18px", opacity: "0.7" }}>
              You'll receive updates via Discord. Keep an eye on your DMs!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Join;
