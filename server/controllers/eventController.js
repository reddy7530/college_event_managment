const db = require("../config/db");

// ==========================================
// GET ALL EVENTS
// GET /api/events
// ==========================================
const getAllEvents = async (req, res) => {
    try {
        const [events] = await db.query(`
            SELECT
                e.*,
                COUNT(
                    CASE
                        WHEN r.status = 'registered'
                        THEN r.id
                    END
                ) AS registeredParticipants
            FROM events e
            LEFT JOIN registrations r
                ON e.id = r.eventId
            GROUP BY e.id
            ORDER BY e.date ASC, e.startTime ASC
        `);

        res.status(200).json(events);

    } catch (error) {
        console.error("GET ALL EVENTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch events"
        });
    }
};


// ==========================================
// GET SINGLE EVENT
// GET /api/events/:id
// ==========================================
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const [events] = await db.query(`
            SELECT
                e.*,
                COUNT(
                    CASE
                        WHEN r.status = 'registered'
                        THEN r.id
                    END
                ) AS registeredParticipants
            FROM events e
            LEFT JOIN registrations r
                ON e.id = r.eventId
            WHERE e.id = ?
            GROUP BY e.id
        `, [id]);

        if (events.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(events[0]);

    } catch (error) {
        console.error("GET EVENT ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch event"
        });
    }
};


// ==========================================
// CREATE EVENT
// POST /api/events
// ==========================================
const createEvent = async (req, res) => {
    try {
        // Make sure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Only organizer/admin can create events
        if (
            req.user.role !== "organizer" &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Only organizers can create events"
            });
        }

        const {
            title,
            description,
            category,
            date,
            startTime,
            endTime,
            venue,
            capacity,
            image
        } = req.body;

        // Required field validation
        if (
            !title ||
            !description ||
            !category ||
            !date ||
            !startTime ||
            !endTime ||
            !venue ||
            capacity === undefined ||
            capacity === ""
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        // Capacity validation
        const numericCapacity = Number(capacity);

        if (
            !Number.isInteger(numericCapacity) ||
            numericCapacity < 1
        ) {
            return res.status(400).json({
                message: "Capacity must be at least 1"
            });
        }

        // Time validation
        if (startTime >= endTime) {
            return res.status(400).json({
                message: "End time must be after start time"
            });
        }

        // Insert event
        const [result] = await db.query(
            `
            INSERT INTO events
            (
                title,
                description,
                category,
                date,
                startTime,
                endTime,
                venue,
                organizerId,
                capacity,
                image,
                status,
                createdAt,
                updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `,
            [
                title.trim(),
                description.trim(),
                category,
                date,
                startTime,
                endTime,
                venue.trim(),
                req.user.id,
                numericCapacity,
                image ? image.trim() : "",
                "published"
            ]
        );

        res.status(201).json({
            message: "Event created successfully",
            eventId: result.insertId
        });

    } catch (error) {
        console.error("CREATE EVENT ERROR:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            requestBody: req.body,
            userId: req.user?.id,
            userRole: req.user?.role
        });

        res.status(500).json({
            message: "Failed to create event"
        });
    }
};


// ==========================================
// UPDATE EVENT
// PUT /api/events/:id
// ==========================================
const updateEvent = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const {
            title,
            description,
            category,
            date,
            startTime,
            endTime,
            venue,
            capacity,
            image
        } = req.body;

        // Validate required fields
        if (
            !title ||
            !description ||
            !category ||
            !date ||
            !startTime ||
            !endTime ||
            !venue ||
            capacity === undefined ||
            capacity === ""
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const numericCapacity = Number(capacity);

        if (
            !Number.isInteger(numericCapacity) ||
            numericCapacity < 1
        ) {
            return res.status(400).json({
                message: "Capacity must be at least 1"
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                message: "End time must be after start time"
            });
        }

        // Find event
        const [events] = await db.query(
            "SELECT * FROM events WHERE id = ?",
            [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const event = events[0];

        // Organizer can edit own event.
        // Admin can edit any event.
        if (
            req.user.role !== "admin" &&
            Number(event.organizerId) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                message: "You cannot modify this event"
            });
        }

        await db.query(
            `
            UPDATE events
            SET
                title = ?,
                description = ?,
                category = ?,
                date = ?,
                startTime = ?,
                endTime = ?,
                venue = ?,
                capacity = ?,
                image = ?
            WHERE id = ?
            `,
            [
                title.trim(),
                description.trim(),
                category,
                date,
                startTime,
                endTime,
                venue.trim(),
                numericCapacity,
                image ? image.trim() : "",
                id
            ]
        );

        res.status(200).json({
            message: "Event updated successfully"
        });

    } catch (error) {
        console.error("UPDATE EVENT ERROR:", error);

        res.status(500).json({
            message: "Failed to update event"
        });
    }
};


// ==========================================
// DELETE EVENT
// DELETE /api/events/:id
// ==========================================
const deleteEvent = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        // Find event
        const [events] = await db.query(
            "SELECT * FROM events WHERE id = ?",
            [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const event = events[0];

        // Organizer can delete own event.
        // Admin can delete any event.
        if (
            req.user.role !== "admin" &&
            Number(event.organizerId) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                message: "You cannot delete this event"
            });
        }

        await db.query(
            "DELETE FROM events WHERE id = ?",
            [id]
        );

        res.status(200).json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.error("DELETE EVENT ERROR:", error);

        res.status(500).json({
            message: "Failed to delete event"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};