// Device detection utility — ACTIVE.
// Tags <html> with device-mobile / device-tablet / device-desktop plus
// has-touch / has-pointer, and dispatches a custom 'device:change' event
// with { device, width, touch } so components can react in JS.

export function getDeviceCategory(width) {
  if (width <= 640) return 'device-mobile';
  if (width <= 1024) return 'device-tablet';
  return 'device-desktop';
}

const DEVICE_CLASSES = ['device-mobile', 'device-tablet', 'device-desktop'];

function applyDeviceClass() {
  const width = window.innerWidth || document.documentElement.clientWidth;
  const deviceClass = getDeviceCategory(width);
  const touch = window.matchMedia?.('(pointer: coarse)').matches || false;
  const html = document.documentElement;

  DEVICE_CLASSES.forEach((c) => html.classList.remove(c));
  html.classList.add(deviceClass);
  html.classList.toggle('has-touch', touch);
  html.classList.toggle('has-pointer', !touch);

  window.dispatchEvent(
    new CustomEvent('device:change', { detail: { device: deviceClass, width, touch } })
  );
}

// Debounced resize handler
let resizeTimer = null;
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applyDeviceClass, 150);
}

// Initialize
if (typeof window !== 'undefined') {
  applyDeviceClass();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', applyDeviceClass);
  // Re-check when the pointer type changes (e.g. laptop with touchscreen)
  window.matchMedia?.('(pointer: coarse)')?.addEventListener?.('change', applyDeviceClass);
}
