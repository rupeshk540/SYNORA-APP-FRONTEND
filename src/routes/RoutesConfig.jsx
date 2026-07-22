import React from 'react'
import { Route, Routes } from 'react-router'
import App from '../App'
import ChatPage from '../pages/ChatPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ProtectedRoute from '../routes/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<App />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <ChatPage/>
            </ProtectedRoute>
          }
        />
    </Routes>
  )
}

export default AppRoutes;