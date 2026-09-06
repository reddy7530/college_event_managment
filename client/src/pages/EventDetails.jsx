import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await api.get(`/events/${id}`);

            setEvent(response.data);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load event"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setRegistering(true);
        setMessage("");
        setError("");

        try {
            const response = await api.post(
                `/registrations/${id}`
            );

            setMessage(
                response.data.message ||
                "Registration successful!"
            );

            // Refresh event so seat count updates
            fetchEvent();

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="event-details">
                <h2>Loading event...</h2>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="event-details">
                <p className="error">{error}</p>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    const registered =
        Number(event.registeredParticipants) || 0;

    const capacity =
        Number(event.capacity) || 0;

    const availableSeats = capacity - registered;

    return (
        <div className="event-details">

            <button
                className="back-button"
                onClick={() => navigate("/events")}
            >
                ← Back to Events
            </button>

            <div className="event-details-card">

                <h1>{event.title}</h1>

                <p className="description">
                    {event.description}
                </p>

                <div className="event-info">

                    <p>
                        <strong>Category:</strong>{" "}
                        {event.category}
                    </p>

                    <p>
                        <strong>Date:</strong>{" "}
                        {new Date(event.date).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                            }
                        )}
                    </p>

                    <p>
                        <strong>Time:</strong>{" "}
                        {event.startTime} - {event.endTime}
                    </p>

                    <p>
                        <strong>Venue:</strong>{" "}
                        {event.venue}
                    </p>

                    <p>
                        <strong>Capacity:</strong>{" "}
                        {registered} / {capacity}
                    </p>

                    <p>
                        <strong>Available Seats:</strong>{" "}
                        {availableSeats}
                    </p>

                </div>

                {message && (
                    <p className="success">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <button
                    className="register-button"
                    onClick={handleRegister}
                    disabled={
                        registering ||
                        availableSeats <= 0
                    }
                >
                    {registering
                        ? "Registering..."
                        : availableSeats <= 0
                        ? "Event Full"
                        : "Register for Event"}
                </button>

            </div>

        </div>
    );
}

export default EventDetails;