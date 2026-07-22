import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import AppRoutes from './routes/RoutesConfig.jsx'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster/>
    <AuthProvider>
      <ChatProvider>
        <AppRoutes/>
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
)
