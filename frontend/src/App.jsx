import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AiChatAssistant from './pages/employee/AiChatAssistant';
import EngineerDashboard from './pages/engineer/EngineerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import KnowledgeBaseManagement from './pages/admin/KnowledgeBaseManagement';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Role-Protected Dashboards */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/chat"
              element={
                <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <AiChatAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/engineer/chat"
              element={
                <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <AiChatAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <AiChatAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <AiChatAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/tickets"
              element={
                <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <EngineerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/engineer/tickets"
              element={
                <ProtectedRoute allowedRoles={['ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <EngineerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/engineer"
              element={
                <ProtectedRoute allowedRoles={['ROLE_SUPPORT_ENGINEER', 'ROLE_ADMIN']}>
                  <EngineerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPPORT_ENGINEER']}>
                  <AiChatAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/documents"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPPORT_ENGINEER']}>
                  <KnowledgeBaseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPPORT_ENGINEER']}>
                  <KnowledgeBaseManagement />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
