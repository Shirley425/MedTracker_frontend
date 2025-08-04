import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IndexPage from "./index";
import Login from "./Components/login";
import LogMedication from "./Components/logMedication";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/features" element={<LogMedication />} />
      </Routes>
    </Router>
  );
}

export default App;

