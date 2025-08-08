import React, { useRef, useEffect, useState } from "react";

function AudioManager({ entityDistance, gameOver, onAudioStop }) {
  const audioRef = useRef(null);
  const breathRef = useRef(null);
  const deathSoundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Create background music audio element
    const audio = new Audio("/bgmusic.mp3");
    audio.loop = true;
    audio.volume = 0.001; // Start very quiet
    audioRef.current = audio;

    // Create breathing sound audio element
    const breathAudio = new Audio("/breath.mp3");
    breathAudio.loop = true;
    breathAudio.volume = 0; // Start at 0 for fade in
    breathRef.current = breathAudio;

    // Create death sound audio element
    const deathAudio = new Audio("/ded.mp3");
    deathAudio.volume = 1.0; // Full volume for death sound
    deathSoundRef.current = deathAudio;

    // Try to play background music immediately (will fail without user interaction)
    const tryAutoPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Autoplay blocked, waiting for user interaction");
      }
    };

    tryAutoPlay();

    // Start breathing sound after 3 seconds with fade in
    const breathTimeout = setTimeout(() => {
      const startBreathingSound = async () => {
        try {
          await breathAudio.play();

          // Fade in the breathing sound over 2 seconds
          const fadeInDuration = 2000; // 2 seconds
          const targetVolume = 0.9; // Reduced volume for breathing
          const fadeSteps = 60; // Number of steps for smooth fade
          const stepTime = fadeInDuration / fadeSteps;
          const volumeStep = targetVolume / fadeSteps;

          let currentStep = 0;
          const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = Math.min(volumeStep * currentStep, targetVolume);
            breathAudio.volume = newVolume;

            if (currentStep >= fadeSteps) {
              clearInterval(fadeInterval);
            }
          }, stepTime);
        } catch (error) {
          console.log("Failed to play breathing sound:", error);
        }
      };

      startBreathingSound();
    }, 3000); // 3 seconds delay

    // Listen for any user interaction to enable audio
    const handleInteraction = async () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.log("Failed to play audio:", error);
        }
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      clearTimeout(breathTimeout);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (breathRef.current) {
        if (breathRef.current.stopTimeout) {
          clearTimeout(breathRef.current.stopTimeout);
        }
        breathRef.current.pause();
        breathRef.current = null;
      }
      if (deathSoundRef.current) {
        if (deathSoundRef.current.timeout) {
          clearTimeout(deathSoundRef.current.timeout);
        }
        if (deathSoundRef.current.breathTimeout) {
          clearTimeout(deathSoundRef.current.breathTimeout);
        }
        if (deathSoundRef.current.allStopTimeout) {
          clearTimeout(deathSoundRef.current.allStopTimeout);
        }
        deathSoundRef.current.pause();
        deathSoundRef.current = null;
      }
    };
  }, [hasInteracted]);

  // Handle game over - stop all audio and play death sound sequence
  useEffect(() => {
    if (gameOver) {
      // Stop all existing audio immediately
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      if (breathRef.current) {
        breathRef.current.pause();
        breathRef.current.currentTime = 0;
      }

      // Play death sound immediately
      if (deathSoundRef.current) {
        deathSoundRef.current.currentTime = 0;
        deathSoundRef.current.volume = 1.0;

        const playDeathSound = async () => {
          try {
            await deathSoundRef.current.play();
            console.log("Death sound started playing");
          } catch (error) {
            console.log("Failed to play death sound:", error);
          }
        };

        playDeathSound();

        // Stop death sound after 3 seconds
        const deathSoundTimeout = setTimeout(() => {
          if (deathSoundRef.current) {
            deathSoundRef.current.pause();
            deathSoundRef.current.currentTime = 0;
            console.log("Death sound stopped after 3 seconds");
          }
        }, 3000);

        // Start breathing sound after 2 seconds
        const breathStartTimeout = setTimeout(() => {
          if (breathRef.current) {
            breathRef.current.currentTime = 0;
            breathRef.current.volume = 0.9;

            const playBreathSound = async () => {
              try {
                await breathRef.current.play();
                console.log("Breath sound started playing");
              } catch (error) {
                console.log("Failed to play breath sound:", error);
              }
            };

            playBreathSound();
          }
        }, 2000);

        // Stop ALL audio after 6 seconds
        const allAudioStopTimeout = setTimeout(() => {
          console.log("Stopping all audio after 6 seconds");
          if (deathSoundRef.current) {
            deathSoundRef.current.pause();
            deathSoundRef.current.currentTime = 0;
          }
          if (breathRef.current) {
            breathRef.current.pause();
            breathRef.current.currentTime = 0;
          }
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          console.log("All audio stopped - ready for join text");
        }, 6000);

        // Store timeouts for cleanup
        deathSoundRef.current.timeout = deathSoundTimeout;
        deathSoundRef.current.breathTimeout = breathStartTimeout;
        deathSoundRef.current.allStopTimeout = allAudioStopTimeout;
      }

      // Notify that audio has stopped
      if (onAudioStop) {
        onAudioStop();
      }
    }
  }, [gameOver, onAudioStop]);

  // Update audio volume based on entity distance (only if not game over)
  useEffect(() => {
    if (!audioRef.current || !isPlaying || gameOver) return;

    // Calculate volume based on entity distance
    // When entity is far (distance > 20), volume is very low (0.05)
    // When entity is close (distance < 5), volume is high (0.8)
    const maxDistance = 8; // Maximum distance for volume calculation
    const minDistance = 2; // Minimum distance for maximum volume
    const minVolume = 0.001; // Minimum volume when entity is far
    const maxVolume = 0.8; // Maximum volume when entity is close

    let volume = minVolume;

    if (entityDistance !== null) {
      if (entityDistance <= minDistance) {
        volume = maxVolume;
      } else if (entityDistance >= maxDistance) {
        volume = minVolume;
      } else {
        // Linear interpolation between min and max volume
        const normalizedDistance = (entityDistance - minDistance) / (maxDistance - minDistance);
        volume = maxVolume - normalizedDistance * (maxVolume - minVolume);
      }
    }

    // Smooth volume transition
    const currentVolume = audioRef.current.volume;
    const volumeDiff = volume - currentVolume;
    const smoothingFactor = 0.1; // Adjust for smoother/faster transitions

    audioRef.current.volume = currentVolume + volumeDiff * smoothingFactor;
  }, [entityDistance, isPlaying, gameOver]);

  // Audio manager runs silently with no UI
  return null;
}

export default AudioManager;
