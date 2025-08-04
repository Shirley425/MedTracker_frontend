import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IndexPage from "./IndexPage";
import Login from "./Login";
import LogMedication from "./LogMedication";

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

