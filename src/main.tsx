import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#f5f0e8',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#c9a84c', secondary: '#1a1a1a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a1a' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
