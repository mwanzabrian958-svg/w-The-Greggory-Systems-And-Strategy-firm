import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Device intelligence: classifies the viewport (phone/tablet/desktop),
// tags <html> with device-* + has-touch classes and broadcasts a
// 'device:change' event so any component can adapt per device.
import './utils/device.js'

const rootEl = document.getElementById('root')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// The inline boot screen in index.html (branded "Signal Core" loader) sits
// inside #root so it paints before any bundle arrives. React clears it on the
// first render; this is an explicit, deterministic removal on top of that.
const bootScreen = document.getElementById('gssf-boot')
if (bootScreen) {
  bootScreen.setAttribute('aria-busy', 'false')
  requestAnimationFrame(() => bootScreen.remove())
}