import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Container } from "react-bootstrap"
import { AuthProvider } from "./contexts/AuthContext"
import Navigation from "./components/Navigation"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import EmployeePage from "./pages/EmployeePage"
import LeaveRequestPage from "./pages/LeaveRequestPage"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Container fluid className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/employees" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute>
                    <EmployeePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leave-requests"
                element={
                  <ProtectedRoute>
                    <LeaveRequestPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Container>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
