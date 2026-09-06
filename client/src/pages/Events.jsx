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

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {

        let result = events;

        if (search.trim()) {
            result = result.filter((event) =>
                event.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                event.description
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                event.venue
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        if (category !== "All") {
            result = result.filter(
                (event) =>
                    event.category === category
            );
        }

        setFilteredEvents(result);

    }, [search, category, events]);

    const fetchEvents = async () => {

        try {

            const response =
                await api.get("/events");

            setEvents(response.data);
            setFilteredEvents(response.data);

        } catch (error) {

            console.error(error);

            setMessage(
                "Unable to load events."
            );

        } finally {

            setLoading(false);

        }
    };

    const formatDate = (date) => {

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getSeatsLeft = (event) => {

        return (
            Number(event.capacity) -
            Number(event.registeredParticipants)
        );

    };

    const getCategoryClass = (category) => {

        return category
            ?.toLowerCase()
            .replace(/\s+/g, "-");

    };

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

            {/* HERO */}

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


            {/* EVENTS */}

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


                {/* SEARCH */}

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


                {message && (
                    <div className="error-box">
                        {message}
                    </div>
                )}


                {/* EVENT GRID */}

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

                            return (

                                <article
                                    className="event-card"
                                    key={event.id}
                                >

                                    <div className="card-top">

                                        <span
                                            className={`category-badge ${getCategoryClass(event.category)}`}
                                        >
                                            {event.category}
                                        </span>

                                        {isFull && (
                                            <span className="full-badge">
                                                FULL
                                            </span>
                                        )}

                                    </div>


                                    <h3>
                                        {event.title}
                                    </h3>

                                    <p className="event-description">
                                        {event.description}
                                    </p>


                                    <div className="event-meta">

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


                                        <div>
                                            <span>📍</span>

                                            <div>
                                                <small>
                                                    VENUE
                                                </small>

                                                <strong>
                                                    {event.venue}
                                                </strong>
                                            </div>
                                        </div>

                                    </div>


                                    <div className="capacity">

                                        <div className="capacity-text">

                                            <span>
                                                👥{" "}
                                                {event.registeredParticipants}
                                                {" / "}
                                                {event.capacity}
                                                {" registered"}
                                            </span>

                                            <strong>
                                                {isFull
                                                    ? "Full"
                                                    : `${seatsLeft} seats left`}
                                            </strong>

                                        </div>

                                        <div className="progress-bar">

                                            <div
                                                className="progress"
                                                style={{
                                                    width: `${Math.min(
                                                        (Number(
                                                            event.registeredParticipants
                                                        ) /
                                                            Number(
                                                                event.capacity
                                                            )) *
                                                            100,
                                                        100
                                                    )}%`
                                                }}
                                            />

                                        </div>

                                    </div>


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