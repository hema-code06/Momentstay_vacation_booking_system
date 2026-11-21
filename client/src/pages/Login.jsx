import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { setLogin } from "../redux/state";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";
import "../styles/Login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const fail = (message) => {
    setError(message);
    toast.error(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        dispatch(setLogin({ user: data.user, token: data.token }));
        toast.success("Welcome back! Login successful.", 2500);
        navigate(location.state?.from || "/", { replace: true });
      } else if (response.status === 404) {
        fail("No account found with this email.");
      } else if (response.status === 401) {
        fail("Incorrect password. Please try again.");
      } else {
        fail(data.message || "Login failed. Please try again later.");
      }
    } catch (err) {
      console.log("Login failed", err.message);
      fail("Login failed. Please try again later.");
    }
  };

  return (
    <div className="login">
      <div className="login_content">
        <h1>Welcome back</h1>

        <form className="login_content_form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>

          {error && <p className="error_message">{error}</p>}
        </form>

        <span>
          Don't have an account? <Link to="/register">Register</Link> here
        </span>
      </div>
    </div>
  );
};

export default Login;
