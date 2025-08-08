export const isMobile = () => {
  // First check for touch capability
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Then check user agent
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;

  // Force mobile if any condition is true
  return hasTouch || isMobileUA || isSmallScreen;
};
