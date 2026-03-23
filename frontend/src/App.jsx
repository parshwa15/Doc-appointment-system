import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorDashboard from "./pages/DoctorDashboard";
import HomePage from "./pages/HomePage";
import HospitalAdminDashboard from "./pages/HospitalAdminDashboard";
import LoginPage from "./pages/LoginPage";
import PatientDashboard from "./pages/PatientDashboard";
import PatientRegisterPage from "./pages/PatientRegisterPage";
import SoftwareAdminDashboard from "./pages/SoftwareAdminDashboard";

const App = () => (
  <div className="min-h-screen">
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/patient/register" element={<PatientRegisterPage />} />

      <Route
        path="/software-admin/dashboard"
        element={
          <ProtectedRoute role="softwareAdmin">
            <SoftwareAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital-admin/dashboard"
        element={
          <ProtectedRoute role="hospitalAdmin">
            <HospitalAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);

export default App;
