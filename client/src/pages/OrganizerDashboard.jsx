import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function OrganizerDashboard() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Technical",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        capacity: "",
        image: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        if (!token || !user) {
            navigate("/login");
            return;
        }

        if (
            user.role !== "organizer" &&
            user.role !== "admin"
        ) {
            navigate("/events");
            return;
        }

        fetchEvents();
    }, [navigate]);

    const fetchEvents = async () => {
        try {
            const response = await api.get("/events");

            const user = JSON.parse(
                localStorage.getItem("user")
            );

            if (user.role === "admin") {
                setEvents(response.data);
            } else {
                setEvents(
                    response.data.filter(
                        (event) =>
                            Number(event.organizerId) ===
                            Number(user.id)
                    )
                );
            }

        } catch (error) {
            console.error(error);

            setMessage(
                "Failed to load events"
            );
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {

                await api.put(
                    `/events/${editingId}`,
                    formData
                );

                setMessage(
                    "Event updated successfully"
                );

            } else {

                await api.post(
                    "/events",
                    formData
                );

                setMessage(
                    "Event created successfully"
                );
            }

            resetForm();
            fetchEvents();

        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Operation failed"
            );
        }
    };

    const editEvent = (event) => {
        setEditingId(event.id);

        setFormData({
            title: event.title || "",
            description: event.description || "",
            category: event.category || "Technical",
            date: event.date
                ? event.date.substring(0, 10)
                : "",
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            venue: event.venue || "",
            capacity: event.capacity || "",
            image: event.image || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const deleteEvent = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await api.delete(`/events/${id}`);

            setMessage(
                "Event deleted successfully"
            );

            fetchEvents();

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Failed to delete event"
            );
        }
    };

    const resetForm = () => {

        setEditingId(null);

        setFormData({
            title: "",
            description: "",
            category: "Technical",
            date: "",
            startTime: "",
            endTime: "",
            venue: "",
            capacity: "",
            image: ""
        });
    };

    return (
        <div className="organizer-page">

            <h1>Organizer Dashboard</h1>

            <p>
                Create and manage your college events.
            </p>

            {message && (
                <p className="dashboard-message">
                    {message}
                </p>
            )}


            {/* CREATE / EDIT FORM */}

            <div className="dashboard-card">

                <h2>
                    {editingId
                        ? "Edit Event"
                        : "Create Event"}
                </h2>

                <form
                    className="event-form"
                    onSubmit={handleSubmit}
                >

                    <input
                        name="title"
                        placeholder="Event Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="Technical">
                            Technical
                        </option>

                        <option value="Competition">
                            Competition
                        </option>

                        <option value="Cultural">
                            Cultural
                        </option>

                        <option value="Workshop">
                            Workshop
                        </option>

                        <option value="Sports">
                            Sports
                        </option>

                        <option value="Seminar">
                            Seminar
                        </option>

                    </select>

                    <label>
                        Date
                    </label>

                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />

                    <label>
                        Start Time
                    </label>

                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />

                    <label>
                        End Time
                    </label>

                    <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="venue"
                        placeholder="Venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="capacity"
                        placeholder="Capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        min="1"
                        required
                    />

                    <input
                        name="image"
                        placeholder="Image URL (optional)"
                        value={formData.image}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        {editingId
                            ? "Update Event"
                            : "Create Event"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="cancel-edit"
                        >
                            Cancel Edit
                        </button>
                    )}

                </form>

            </div>


            {/* MY EVENTS */}

            <div className="dashboard-events">

                <h2>
                    My Events
                </h2>

                {events.length === 0 ? (

                    <p>
                        You have not created any events yet.
                    </p>

                ) : (

                    <div className="organizer-event-list">

                        {events.map((event) => (

                            <div
                                className="organizer-event"
                                key={event.id}
                            >

                                <div>

                                    <h3>
                                        {event.title}
                                    </h3>

                                    <p>
                                        {event.category}
                                    </p>

                                    <p>
                                        Date:{" "}
                                        {new Date(
                                            event.date
                                        ).toLocaleDateString()}
                                    </p>

                                    <p>
                                        Venue:{" "}
                                        {event.venue}
                                    </p>

                                    <p>
                                        Registrations:{" "}
                                        {event.registeredParticipants}
                                        {" / "}
                                        {event.capacity}
                                    </p>

                                </div>

                                <div className="event-actions">

                                    <button
                                        onClick={() =>
                                            editEvent(event)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            deleteEvent(event.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default OrganizerDashboard;