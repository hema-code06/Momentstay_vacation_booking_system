import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";
import "../styles/Register.scss";

const FIELDS = [
  { name: "username", placeholder: "Username", type: "text" },
  { name: "email", placeholder: "Email address", type: "email" },
  { name: "password", placeholder: "Password", type: "password" },
  { name: "confirmPassword", placeholder: "Confirm Password", type: "password" },
];

const EMPTY_ERRORS = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  profileImage: "",
  general: "",
};

const Register = () => {
  const [formData, setFormData] = useState({
    profileImage: null,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(EMPTY_ERRORS);
  const navigate = useNavigate();
  const toast = useToast();

  const previewUrl = useMemo(
    () => (formData.profileImage ? URL.createObjectURL(formData.profileImage) : null),
    [formData.profileImage]
  );

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "profileImage" ? files[0] : value }));
  };

  const validate = () => {
    const errors = { ...EMPTY_ERRORS };
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!formData.profileImage) errors.profileImage = "Profile image is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    setError(errors);
    const firstError = Object.values(errors).find(Boolean);
    if (firstError) {
      toast.error(firstError);
      return;
    }

    const body = new FormData();
    body.append("username", formData.username.trim());
    body.append("email", formData.email.trim());
    body.append("password", formData.password);
    body.append("profileImage", formData.profileImage);

    try {
      const response = await apiFetch("/auth/register", { method: "POST", body });

      if (response.ok) {
        toast.success("Account created successfully! Please login.", 2500);
        navigate("/login");
      } else {
        const data = await response.json().catch(() => ({}));
        const message = data.message || "Registration failed!";
        setError({ ...EMPTY_ERRORS, general: message });
        toast.error(message);
      }
    } catch (err) {
      const message = `Registration failed! ${err.message}`;
      setError({ ...EMPTY_ERRORS, general: message });
      toast.error(message);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <h1>Join MomentStay</h1>

        <div className="profile-image-wrapper">
          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="image">
            <img src={previewUrl || "/assets/person.png"} alt="profile" />
            {!previewUrl && <p>Upload Profile Picture</p>}
            {error.profileImage && <p className="error_message">{error.profileImage}</p>}
          </label>
        </div>

        <form className="register_content_form" onSubmit={handleSubmit}>
          {FIELDS.map(({ name, placeholder, type }) => (
            <div className="form-group" key={name}>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
              />
              {error[name] && <p>{error[name]}</p>}
            </div>
          ))}
          <button type="submit">Register</button>
        </form>

        <span>
          Already Registered? <Link to="/login">Login</Link> here
        </span>

        {error.general && <p className="error_message">{error.general}</p>}
      </div>
    </div>
  );
};

export default Register;
