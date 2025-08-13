import React, { useRef, useEffect, useState } from "react";
import { supabase } from '../../lib/supabase'; 

function Join() {
  const [username, setUsername] = useState("");
  const [showLinks, setShowLinks] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 768); // 🔹 desktop vs mobile
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !inputDisabled) {
      inputRef.current.focus();
    }
  }, [inputDisabled]);

  // 🔹 Keep this screen responsive to window resizes
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // -------- Supabase --------
  const submitToSupabase = async (username) => {
    const { data, error } = await supabase.from('waitlist').select('count');
    console.log("Test query result:", { data, error });

    try {
      const currentTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });

      const { count } = await supabase.from('waitlist').select('*', { count: 'exact' });

      const { data: insertData, error: insertError } = await supabase
        .from('waitlist')
        .insert({
          username: String(username),
          joined_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.error("Error saving data to Supabase:", insertError);
        setSubmitStatus("❌ Error adding to waitlist. Please try again.");
        return false;
      }

      console.log("Data saved successfully to Supabase:", insertData);
      setSubmitStatus("✅ Successfully added to waitlist!");
      return true;
    } catch (err) {
      console.error("Error during Supabase operation:", err);
      setSubmitStatus("❌ Network error. Please check your connection.");
      return false;
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && username.trim() && !isSubmitting) {
      setIsSubmitting(true);
      setInputDisabled(true);
      setShowCursor(false);
      setSubmitStatus("⏳ Adding to waitlist...");

      const success = await submitToSupabase(username.trim());

      if (success) {
        setTimeout(() => setShowLinks(true), 1000);
      } else {
        setInputDisabled(false);
        setShowCursor(true);
      }

      setIsSubmitting(false);
    }
  };

  const handleFocus = () => setShowCursor(false);
  const handleBlur = () => { if (!inputDisabled) setShowCursor(true); };
  const handleClick = () => { if (!inputDisabled && inputRef.current) inputRef.current.focus(); };

  // 🔹 Desktop vs Mobile sizes
  const baseFont = isDesktop ? 22 : 18;
  const pad = isDesktop ? 32 : 15;
  const asciiSize = isDesktop ? 16 : 10;
  const instructionSize = isDesktop ? 20 : 16;
  const inputFont = isDesktop ? 22 : 18;
  const statusSize = isDesktop ? 16 : 14;
  const linkTitleSize = isDesktop ? 18 : 16;
  const linkTextSize = isDesktop ? 16 : 14;
  const footerSize = isDesktop ? 14 : 12;

  return (
    <div
      className='terminal'
      onClick={handleClick}
      style={{
        width: "100%",
        height: "100vh",
        padding: `${pad}px`,
        backgroundColor: "#000",
        color: "#00ff00",
        fontFamily: "'Jersey 15', monospace",
        fontSize: `${baseFont}px`,
        lineHeight: "1.35",
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

          .terminal { overflow-y: auto; }

          .cursor {
            display: inline-block;
            width: 6px;
            height: 12px;
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
            outline: none;
            flex: 1;
          }

          .links a {
            color: #00ff00;
            text-decoration: underline;
          }
          .links a:hover { color: #00ffff; }

          .status-message { opacity: 0.8; }

          /* --- Mobile tweaks stay the same --- */
          @media (max-width: 768px) {
            .terminal { font-size: 14px !important; padding: 10px !important; }
            .terminal-input { font-size: 14px !important; }
            .ascii-art { font-size: 8px !important; line-height: 1.1 !important; }
            .status-message { font-size: 12px !important; }
          }

          @media (max-width: 480px) {
            .terminal { font-size: 12px !important; padding: 8px !important; }
            .terminal-input { font-size: 12px !important; }
            .ascii-art { font-size: 6px !important; line-height: 1.0 !important; }
            .status-message { font-size: 10px !important; }
          }
        `}
      </style>

      {/* ASCII Art */}
      <div
        className="ascii-art"
        style={{
          marginBottom: isDesktop ? "18px" : "15px",
          whiteSpace: "pre",
          fontSize: `${asciiSize}px`,
          lineHeight: isDesktop ? "1.15" : "1.2",
          overflow: "hidden"
        }}
      >
        {`██████╗░██╗░░░░░░█████╗░░█████╗░██╗░░██╗██████╗░░█████╗░░█████╗░███╗░░░███╗░██████╗
██╔══██╗██║░░░░░██╔══██╗██╔══██╗██║░██╔╝██╔══██╗██╔══██╗██╔══██╗████╗░████║██╔════╝
██████╦╝██║░░░░░██║░░██║██║░░╚═╝█████═╝░██████╔╝██║░░██║██║░░██║██╔████╔██║╚█████╗░
██╔══██╗██║░░░░░██║░░██║██║░░██╗██╔═██╗░██╔══██╗██║░░██║██║░░██║██║╚██╔╝██║░╚═══██╗
██████╦╝███████╗╚█████╔╝╚█████╔╝██║░╚██╗██║░░██║╚█████╔╝╚█████╔╝██║░╚═╝░██║██████╔╝
╚═════╝░╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░░░░╚═╝╚═════╝░`}
      </div>

      <div style={{ marginTop: isDesktop ? "24px" : "20px" }}>
        <div style={{ fontSize: `${instructionSize}px`, marginBottom: "8px" }}>
          Enter your Discord Username to join the waitlist
        </div>

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
            style={{ fontSize: `${inputFont}px` }} /* 🔹 bigger on desktop */
          />
          {showCursor && <span className='cursor'></span>}
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div
            className="status-message"
            style={{ fontSize: `${statusSize}px`, marginTop: "8px" }}
          >
            {submitStatus}
          </div>
        )}

        {showLinks && (
          <div className='links' style={{ marginTop: isDesktop ? "18px" : "15px" }}>
            <div style={{ marginBottom: "8px", fontSize: `${linkTitleSize}px` }}>
              Welcome to the waitlist! Join our community:
            </div>
            <div style={{ fontSize: `${linkTextSize}px`, marginBottom: "5px" }}>
              Twitter:{" "}
              <a href='https://x.com/_BlockRooms' target='_blank' rel='noopener noreferrer'>
                https://x.com/_BlockRooms
              </a>
            </div>
            <div style={{ fontSize: `${linkTextSize}px`, marginBottom: "8px" }}>
              Discord:{" "}
              <a href='https://discord.com/invite/jcpgh3KS3z' target='_blank' rel='noopener noreferrer'>
                https://discord.com/invite/jcpgh3KS3z
              </a>
            </div>
            <div style={{ marginTop: "10px", fontSize: `${footerSize}px`, opacity: 0.7 }}>
              You'll receive updates via Discord. Keep an eye on your DMs!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Join;
