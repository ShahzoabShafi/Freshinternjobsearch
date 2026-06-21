import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css' // Your newly updated Tailwind v4 file!
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)