import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AiAssessment from "./pages/AiAssessment.jsx";
import HomeRemediesPage from "./pages/ai-assessment/HomeRemediesPage.jsx";
import LabTestsPage from "./pages/ai-assessment/LabTestsPage.jsx";
import DoctorsPage from "./pages/ai-assessment/DoctorsPage.jsx";
import DietPage from "./pages/ai-assessment/DietPage.jsx";
import FinalReportPage from "./pages/ai-assessment/FinalReportPage.jsx";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./state/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assessment"
            element={
              <ProtectedRoute>
                <AiAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assessment/home-remedies"
            element={
              <ProtectedRoute>
                <HomeRemediesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assessment/lab-tests"
            element={
              <ProtectedRoute>
                <LabTestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assessment/doctors"
            element={
              <ProtectedRoute>
                <DoctorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assessment/diet"
            element={
              <ProtectedRoute>
                <DietPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assessment/final-report"
            element={
              <ProtectedRoute>
                <FinalReportPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
