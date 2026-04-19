import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage";
import Login from "./Components/Login";
import AboutUs from "./Components/AboutUs";
import Features from "./Components/Features";
import Dashboard from "./Components/Dashboard";
import Navbar from "./Components/Navbar";
import OpenFDA from "./Components/OpenFDA";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className='container'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/openfda' element={<OpenFDA />} />
            <Route path='/features' element={<Features />} />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/login' element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
