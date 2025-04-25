import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import ReportForm from './components/ReportForm';
import ReportTracker from './components/ReportTracker';
import LegalGuidance from './components/LegalGuidance';
import EducationalContentHub from './components/EducationalContentHub';
import PrivateRoute from './components/PrivateRoute';
import LegalResourcesHub from './components/LegalResourcesHub';
import DocumentHub from './components/DocumentHub.jsx';
import Forum from './components/Forum/Forum';
import PostDetail from './components/Forum/PostDetail';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/educational-content" element={<EducationalContentHub />} />
            <Route
              path="/report/create"
              element={
                <PrivateRoute>
                  <ReportForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/report/tracker"
              element={
                <PrivateRoute>
                  <ReportTracker />
                </PrivateRoute>
              }
            />
            <Route
              path="/legal-guidance"
              element={
                <PrivateRoute>
                  <LegalGuidance />
                </PrivateRoute>
              }
            />
            <Route
              path="/legal-resources"
              element={
                <PrivateRoute>
                  <LegalResourcesHub />
                </PrivateRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <PrivateRoute>
                  <DocumentHub />
                </PrivateRoute>
              }
            />
            <Route
              path="/forum"
              element={
                <PrivateRoute>
                  <Forum />
                </PrivateRoute>
              }
            />
            <Route
              path="/forum/posts/:id"
              element={
                <PrivateRoute>
                  <PostDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 