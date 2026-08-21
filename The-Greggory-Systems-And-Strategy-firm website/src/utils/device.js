// Simple device detection utility
// Adds a class to <html> and dispatches a custom event 'device:change' with { device }

function getDeviceCategory(width) {
  if (width <= 640) return 'device-mobile';
  if (width <= 1024) return 'device-tablet';
  return 'device-desktop';
}

function applyDeviceClass() {
  const width = window.innerWidth || document.documentElement.clientWidth;
  const deviceClass = getDeviceCategory(width);
  const html = document.documentElement;

  // Remove any previous device-* classes
  html.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
  html.classList.add(deviceClass);

  // Emit event for components that want to react in JS
  const ev = new CustomEvent('device:change', { detail: { device: deviceClass, width } });
  window.dispatchEvent(ev);
}

// Debounced resize handler
let resizeTimer = null;
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    applyDeviceClass();
  }, 150);
}

// Initialize
if (typeof window !== 'undefined') {
  applyDeviceClass();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', applyDeviceClass);
}

// Device utility disabled — reverted to original state
export const __device_disabled = true;
