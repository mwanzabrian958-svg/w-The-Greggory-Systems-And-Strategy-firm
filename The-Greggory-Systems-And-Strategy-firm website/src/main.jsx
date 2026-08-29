import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Device intelligence: classifies the viewport (phone/tablet/desktop),
// tags <html> with device-* + has-touch classes and broadcasts a
// 'device:change' event so any component can adapt per device.
import './utils/device.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)