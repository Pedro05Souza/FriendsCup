import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/big-shoulders-display/600'
import '@fontsource/big-shoulders-display/700'
import '@fontsource/big-shoulders-display/800'
import '@fontsource/big-shoulders-display/900'
import '@fontsource/figtree/400'
import '@fontsource/figtree/500'
import '@fontsource/figtree/600'
import '@fontsource/figtree/700'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
