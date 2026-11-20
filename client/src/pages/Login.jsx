import { useState } from "react";
import { setLogin } from "../redux/state";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.scss";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let loggedIn;
      try {
        loggedIn = await response.json();
      } catch (err) {
        throw new Error("Invalid server response");
      }

      if (response.ok) {
        dispatch(setLogin({ user: loggedIn.user, token: loggedIn.token }));
        toast.success("Welcome back! Login successful 🎉", 2500);
        setTimeout(() => navigate("/"), 2200);
      } else {
        const message = (loggedIn.message || "").toLowerCase();
        if (message.includes("exist")) {
          setEmailError("No account found with this email.");
          toast.error("No account found with this email.");
        } else if (message.includes("credentials")) {
          setPasswordError("Incorrect password. Please try again.");
          toast.error("Incorrect password. Please try again.");
        } else {
          setEmailError("Login failed. Please check your credentials.");
          toast.error("Login failed. Please check your credentials.");
        }
      }
    } catch (err) {
      console.log("Login failed", err.message);
      setEmailError("Login failed. Please try again later.");
      toast.error("Login failed. Please try again later.");
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

          {emailError && <p className="error_message">{emailError}</p>}
          {passwordError && <p className="error_message">{passwordError}</p>}
        </form>

        <span>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>{" "}
          here
        </span>
      </div>
    </div>
  );
};

export default Login;
