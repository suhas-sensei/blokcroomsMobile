import React, { useRef, useEffect, useState } from "react";
import { supabase } from '../../lib/supabase'; 

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

// Function to send data to Supabase
const submitToSupabase = async username => {
  console.log("ENV URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("ENV KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 30) + "...");
  
  // Try a simple test
  const { data, error } = await supabase.from('waitlist').select('count');
  console.log("Test query result:", { data, error });
  try {
    // Format current time in user's local timezone
    const currentTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
    
    // Get total count for sl_no
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact' });

    // Insert data with sequential sl_no
    const { data, error } = await supabase
      .from('waitlist')
      .insert({

        username: String(username),
        joined_at: new Date().toISOString()

      })
      .select();

    if (error) {
      console.error("Error saving data to Supabase:", error);
      setSubmitStatus("❌ Error adding to waitlist. Please try again.");
      return false;
    }

    console.log("Data saved successfully to Supabase:", data);
    setSubmitStatus("✅ Successfully added to waitlist!");
    return true;

  } catch (error) {
    console.error("Error during Supabase operation:", error);
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

    // Submit to Supabase (change this line)
    const success = await submitToSupabase(username.trim());

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
