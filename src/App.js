import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import AuthContext from './context/AuthContext';

import 'leaflet/dist/leaflet.css'; 

import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import ArticlePage from './pages/ArticlePage';
import Summary from './pages/Summary';
import Login from './pages/Login';
import WeightTraining from './pages/WeightTraining';
import Cardio from './pages/Cardio';
import Supplements from './pages/Supplements';
import Nutrition from './pages/Nutrition';
import Profile from './pages/Profile';
import SearchPage from './pages/SearchPage';  

// New: simple wrapper components that embed the static html files
function Privacy() {
  return (
    <iframe
      src="/privacy.html"
      title="Privacy Policy"
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  );
}

function Terms() {
  return (
    <iframe
      src="/terms.html"
      title="Terms of Service"
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  );
}

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <CssBaseline />
      
      {/* Header fixed at the top */}
      {user && <Header />}
      
      {/* Sidebar fixed on the left */}
      {user && <Sidebar />}
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          marginLeft: { xs: 0, lg: user ? '260px' : 0 }, 
          paddingTop: user ? '80px' : 0, 
          paddingX: { xs: 2, lg: 4 },
          paddingBottom: 4,
          boxSizing: 'border-box'
        }}
      >
        <Routes>
          {/* Public routes - no auth required */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="/" element={user ? <Navigate to="/summary" /> : <Login />} />
          <Route path="/summary" element={user ? <Summary /> : <Navigate to="/" />} />
          <Route path="/weights" element={user ? <WeightTraining /> : <Navigate to="/" />} />
          <Route path="/cardio" element={user ? <Cardio /> : <Navigate to="/" />} />
          <Route path="/supplements" element={user ? <Supplements /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />         
          <Route path="/nutrition" element={user ? <Nutrition /> : <Navigate to="/" />} />
          <Route path="/search" element={user ? <SearchPage /> : <Navigate to="/" />} />
          <Route path="/article/:id" element={user ? <ArticlePage /> : <Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
