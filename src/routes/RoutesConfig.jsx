import React from 'react'
import { Route, Routes } from 'react-router'
import DashboardPage from '../pages/DashboardPage'
import ChatPage from '../pages/ChatPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ProtectedRoute from '../routes/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<ProtectedRoute><DashboardPage/></ProtectedRoute>} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/chat' element={<ProtectedRoute><ChatPage/></ProtectedRoute>} />
    </Routes>
  )
}

export default AppRoutes;