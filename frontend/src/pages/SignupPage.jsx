import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup as apiSignup } from "../api/client.jsx";
import { useAuth } from "../state/AuthContext.jsx";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiSignup({ name, email, password, ageGroup });
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Create an account</h1>
        <p className="auth-subtitle">
          Your data is stored securely and used only to personalise risk
          estimates like age group and history.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name (optional)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <label>
            Age group
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              required
            >
              <option value="child">Child</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </label>
          {error && <p className="error-text">{error}</p>}
          <button
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

