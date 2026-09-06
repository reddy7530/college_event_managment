import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="navbar">

            <Link to="/events" className="brand">
                <span className="brand-icon">🎓</span>
                EventHub
            </Link>

            <div className="nav-links">

                <Link to="/events">
                    Events
                </Link>

                {token && user?.role === "student" && (
                    <Link to="/my-registrations">
                        My Registrations
                    </Link>
                )}
                {token &&
                    (user?.role === "organizer" ||
                        user?.role === "admin") && (
                        <Link to="/organizer">
                            Organizer Dashboard
                        </Link>
                )}

                {!token ? (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="nav-button"
                        >
                            Register
                        </Link>
                    </>
                ) : (
                    <div className="user-section">

                        <span className="user-name">
                            👤 {user?.name}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>

                    </div>
                )}

            </div>

        </nav>
    );
}

export default Navbar;