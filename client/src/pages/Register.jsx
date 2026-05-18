import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.scss";

const Register = () => {
  const [formData, setFormData] = useState({
    profileImage: null,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState({
    username: "", email: "", password: "",
    confirmPassword: "", profileImage: "", general: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: name === "profileImage" ? files[0] : value });
  };

  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword || formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = { username: "", email: "", password: "", confirmPassword: "", profileImage: "", general: "" };

    if (!formData.username) errors.username = "Username is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    if (!formData.profileImage) errors.profileImage = "Profile image is required";
    if (!passwordMatch) errors.confirmPassword = "Passwords do not match";

    setError(errors);

    if (Object.values(errors).every((err) => err === "")) {
      try {
        const register_form = new FormData();
        for (let key in formData) register_form.append(key, formData[key]);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
          method: "POST",
          body: register_form,
        });

        if (response.ok) {
          setSuccess("Registered successfully");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          const result = await response.json();
          setError({ ...errors, general: result.message || "Registration Failed!" });
        }
      } catch (err) {
        setError({ ...errors, general: "Registration Failed! " + err.message });
      }
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <h1>Create account</h1>

        <div className="profile-image-wrapper">
          <input id="image" type="file" name="profileImage"
            accept="image/*" style={{ display: "none" }} onChange={handleChange} />
          <label htmlFor="image">
            <img
              src={formData.profileImage ? URL.createObjectURL(formData.profileImage) : "/assets/person.png"}
              alt="profile"
            />
            {!formData.profileImage && <p>Upload Profile Picture</p>}
            {error.profileImage && <p className="error_message">{error.profileImage}</p>}
          </label>
        </div>

        <form className="register_content_form" onSubmit={handleSubmit}>
          {[
            { name: "username", placeholder: "Username", type: "text" },
            { name: "email", placeholder: "Email address", type: "email" },
            { name: "password", placeholder: "Password", type: "password" },
            { name: "confirmPassword", placeholder: "Confirm Password", type: "password" },
          ].map(({ name, placeholder, type }) => (
            <div className="form-group" key={name}>
              <input
                name={name} type={type} placeholder={placeholder}
                value={formData[name]} onChange={handleChange}
              />
              {error[name] && <p>{error[name]}</p>}
            </div>
          ))}
          <button type="submit">Register</button>
        </form>

        <span>
          Already have an account? <a href="/login">Login</a> here
        </span>

        {success && <p className="success_message">{success}</p>}
        {error.general && <p className="error_message">{error.general}</p>}
      </div>
    </div>
  );
};

export default Register;