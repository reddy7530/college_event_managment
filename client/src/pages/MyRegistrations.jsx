import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyRegistrations() {
    const navigate = useNavigate();

    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const response = await api.get("/registrations/my");
            setRegistrations(response.data);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to load registrations"
            );
        } finally {
            setLoading(false);
        }
    };

    const cancelRegistration = async (eventId) => {
        try {
            await api.delete(`/registrations/${eventId}`);

            setMessage(
                "Registration cancelled successfully"
            );

            fetchRegistrations();

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to cancel registration"
            );
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="registrations-page">

            <h1>My Registrations</h1>

            {message && (
                <p className="registration-message">
                    {message}
                </p>
            )}

            {registrations.length === 0 ? (

                <div>
                    <p>You have no registrations.</p>

                    <button
                        onClick={() => navigate("/events")}
                    >
                        Browse Events
                    </button>
                </div>

            ) : (

                <div className="registration-list">

                    {registrations.map((registration) => (

                        <div
                            className="registration-card"
                            key={registration.id}
                        >

                            <h2>
                                {registration.title}
                            </h2>

                            <p>
                                <strong>Category:</strong>{" "}
                                {registration.category}
                            </p>

                            <p>
                                <strong>Date:</strong>{" "}
                                {new Date(
                                    registration.date
                                ).toLocaleDateString()}
                            </p>

                            <p>
                                <strong>Time:</strong>{" "}
                                {registration.startTime}
                                {" - "}
                                {registration.endTime}
                            </p>

                            <p>
                                <strong>Venue:</strong>{" "}
                                {registration.venue}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {registration.status}
                            </p>

                            {registration.status === "registered" && (
                                <button
                                    onClick={() =>
                                        cancelRegistration(
                                            registration.eventId
                                        )
                                    }
                                >
                                    Cancel Registration
                                </button>
                            )}

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default MyRegistrations;