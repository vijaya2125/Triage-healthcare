import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">SafeHealth Triage</span>
      </div>
      <nav className="navbar-right">
        <Link
          to="/"
          className={
            location.pathname === "/" ? "nav-link active" : "nav-link"
          }
        >
          Home
        </Link>
        {token && (
          <>
            <Link
              to="/dashboard"
              className={
                location.pathname === "/dashboard"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Dashboard
            </Link>
            <Link
              to="/ai-assessment"
              className={
                location.pathname.startsWith("/ai-assessment")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Assessment
            </Link>
          </>
        )}
        {!token && (
          <>
            <Link
              to="/login"
              className={
                location.pathname === "/login"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={
                location.pathname === "/signup"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Sign up
            </Link>
          </>
        )}
        {token && (
          <div className="nav-user">
            <span className="nav-user-name">
              {user?.name || user?.email || "You"}
            </span>
            <button className="btn-secondary small" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

