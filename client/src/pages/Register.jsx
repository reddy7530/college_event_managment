import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        college: "",
        department: "",
        year: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            await api.post(
                "/auth/register",
                formData
            );

            setMessage(
                "Registration successful. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>College Event Portal</h1>

                <h2>Create Account</h2>

                <form onSubmit={handleRegister}>

                    <input
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="student">
                            Student
                        </option>

                        <option value="organizer">
                            Organizer
                        </option>
                    </select>

                    <input
                        name="college"
                        placeholder="College"
                        value={formData.college}
                        onChange={handleChange}
                    />

                    <input
                        name="department"
                        placeholder="Department"
                        value={formData.department}
                        onChange={handleChange}
                    />

                    <input
                        name="year"
                        placeholder="Year"
                        value={formData.year}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Account"}
                    </button>

                </form>

                {message && (
                    <p>{message}</p>
                )}

                <p>
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;