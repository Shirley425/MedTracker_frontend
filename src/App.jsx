import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import AboutUs from "./pages/AboutUs/AboutUs";
import Features from "./pages/Features/Features";
import Dashboard from "./pages/Dashboard/Dashboard";
import Navbar from "./components/Navbar/Navbar";
import OpenFDA from "./pages/OpenFDA/OpenFDA";
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
