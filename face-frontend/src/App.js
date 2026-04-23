import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Gallery from "./pages/Gallery";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Persons from "./pages/Persons";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      {/* 🌌 Global Background */}
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #020617, #020024, #0f172a)",
          padding: 2
        }}
      >
        <Routes>
          {/* 🔓 Public Route */}
          <Route path="/login" element={<Login />} />

          {/* 🔐 Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/persons" element={<Persons />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
