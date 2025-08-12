export const requestFullscreen = () => {
  const element = document.documentElement;
  
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};

export const lockOrientation = () => {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(err => {
      console.log('Orientation lock failed:', err);
    });
  } else if (screen.lockOrientation) {
    screen.lockOrientation('landscape');
  } else if (screen.webkitLockOrientation) {
    screen.webkitLockOrientation('landscape');
  } else if (screen.mozLockOrientation) {
    screen.mozLockOrientation('landscape');
  }
};

export const hideAddressBar = () => {
  // Hide address bar on mobile
  setTimeout(() => {
    window.scrollTo(0, 1);
  }, 100);
};