import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Events() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // Fetch events when page loads
    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events whenever search/category/events change
    useEffect(() => {
        let result = Array.isArray(events) ? events : [];

        // Search filter
        if (search.trim()) {
            const searchText = search.toLowerCase();

            result = result.filter((event) => {
                const title = String(event.title || "").toLowerCase();
                const description = String(
                    event.description || ""
                ).toLowerCase();
                const venue = String(event.venue || "").toLowerCase();

                return (
                    title.includes(searchText) ||
                    description.includes(searchText) ||
                    venue.includes(searchText)
                );
            });
        }

        // Category filter
        if (category !== "All") {
            result = result.filter(
                (event) => event.category === category
            );
        }

        setFilteredEvents(result);
    }, [search, category, events]);

    // Fetch events from backend
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setMessage("");

            const response = await api.get("/events");

            console.log("EVENT API RESPONSE:", response.data);

            /*
             * Handle different possible backend response formats.
             *
             * Format 1:
             * [
             *   { id: 1, title: "Event 1" }
             * ]
             *
             * Format 2:
             * {
             *   events: [
             *      { id: 1, title: "Event 1" }
             *   ]
             * }
             *
             * Format 3:
             * {
             *   data: [
             *      { id: 1, title: "Event 1" }
             *   ]
             * }
             */

            let eventList = [];

            if (Array.isArray(response.data)) {
                eventList = response.data;
            } else if (Array.isArray(response.data?.events)) {
                eventList = response.data.events;
            } else if (Array.isArray(response.data?.data)) {
                eventList = response.data.data;
            }

            console.log("EVENT LIST:", eventList);

            setEvents(eventList);
            setFilteredEvents(eventList);

            if (eventList.length === 0) {
                setMessage("No events available.");
            }
        } catch (error) {
            console.error("Error fetching events:", error);

            setEvents([]);
            setFilteredEvents([]);

            setMessage(
                error.response?.data?.message ||
                "Unable to load events."
            );
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) {
            return "Date not available";
        }

        const formattedDate = new Date(date);

        if (isNaN(formattedDate.getTime())) {
            return "Date not available";
        }

        return formattedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Calculate remaining seats
    const getSeatsLeft = (event) => {
        const capacity = Number(event.capacity || 0);
        const registered = Number(
            event.registeredParticipants || 0
        );

        return capacity - registered;
    };

    // Category CSS class
    const getCategoryClass = (category) => {
        return String(category || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    // Loading screen
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <main>

            {/* ================= HERO ================= */}

            <section className="hero">
                <div className="hero-content">

                    <span className="hero-badge">
                        🎉 Campus Events
                    </span>

                    <h1>
                        Discover.
                        <br />
                        Connect.
                        <br />
                        <span>Experience.</span>
                    </h1>

                    <p>
                        Explore exciting events,
                        workshops, competitions and
                        activities happening across
                        your campus.
                    </p>

                </div>
            </section>


            {/* ================= EVENTS ================= */}

            <section className="events-section">

                <div className="section-heading">

                    <div>
                        <span className="section-label">
                            EXPLORE
                        </span>

                        <h2>
                            Upcoming Events
                        </h2>
                    </div>

                    <span className="event-count">
                        {filteredEvents.length} events
                    </span>

                </div>


                {/* ================= SEARCH & FILTER ================= */}

                <div className="filters">

                    <div className="search-box">

                        <span>🔎</span>

                        <input
                            type="text"
                            placeholder="Search events, venues..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >
                        <option value="All">
                            All Categories
                        </option>

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

                        <option value="Hackathon">
                            Hackathon
                        </option>

                        <option value="Sports">
                            Sports
                        </option>

                        <option value="Seminar">
                            Seminar
                        </option>
                    </select>

                </div>


                {/* ================= ERROR / MESSAGE ================= */}

                {message && (
                    <div className="error-box">
                        {message}
                    </div>
                )}


                {/* ================= EVENT GRID ================= */}

                {filteredEvents.length === 0 ? (

                    <div className="empty-state">

                        <div>🔍</div>

                        <h3>
                            No events found
                        </h3>

                        <p>
                            Try another search or category.
                        </p>

                    </div>

                ) : (

                    <div className="events-grid">

                        {filteredEvents.map((event) => {

                            const seatsLeft =
                                getSeatsLeft(event);

                            const isFull =
                                seatsLeft <= 0;

                            const capacity =
                                Number(event.capacity || 0);

                            const registered =
                                Number(
                                    event.registeredParticipants || 0
                                );

                            const percentage =
                                capacity > 0
                                    ? Math.min(
                                        (registered / capacity) * 100,
                                        100
                                    )
                                    : 0;

                            return (

                                <article
                                    className="event-card"
                                    key={event.id}
                                >

                                    {/* CARD TOP */}

                                    <div className="card-top">

                                        <span
                                            className={`category-badge ${getCategoryClass(
                                                event.category
                                            )}`}
                                        >
                                            {event.category ||
                                                "General"}
                                        </span>


                                        {isFull && (
                                            <span className="full-badge">
                                                FULL
                                            </span>
                                        )}

                                    </div>


                                    {/* TITLE */}

                                    <h3>
                                        {event.title ||
                                            "Untitled Event"}
                                    </h3>


                                    {/* DESCRIPTION */}

                                    <p className="event-description">
                                        {event.description ||
                                            "No description available."}
                                    </p>


                                    {/* EVENT META */}

                                    <div className="event-meta">

                                        {/* DATE */}

                                        <div>

                                            <span>📅</span>

                                            <div>

                                                <small>
                                                    DATE
                                                </small>

                                                <strong>
                                                    {formatDate(
                                                        event.date
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* VENUE */}

                                        <div>

                                            <span>📍</span>

                                            <div>

                                                <small>
                                                    VENUE
                                                </small>

                                                <strong>
                                                    {event.venue ||
                                                        "Venue not available"}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* CAPACITY */}

                                    <div className="capacity">

                                        <div className="capacity-text">

                                            <span>
                                                👥{" "}
                                                {registered}
                                                {" / "}
                                                {capacity}
                                                {" registered"}
                                            </span>

                                            <strong>
                                                {isFull
                                                    ? "Full"
                                                    : `${Math.max(
                                                        seatsLeft,
                                                        0
                                                    )} seats left`}
                                            </strong>

                                        </div>


                                        <div className="progress-bar">

                                            <div
                                                className="progress"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>

                                    </div>


                                    {/* VIEW EVENT */}

                                    <Link
                                        to={`/events/${event.id}`}
                                        className="details-button"
                                    >
                                        View Event
                                        <span>→</span>
                                    </Link>

                                </article>
                            );
                        })}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Events;