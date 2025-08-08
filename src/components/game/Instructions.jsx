import React from "react";
import { isMobile } from "../../utils/device";

function Instructions({ gameOver }) {
  if (gameOver) return null; // Hide instructions when game is over

  const mobile = isMobile();

  // You can add instruction rendering logic here if needed
  // For now, returning null as the original component was empty
  return null;
}

export default Instructions;
