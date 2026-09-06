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

        res.json(events);

    } catch (error) {
        console.error("Get events error:", error);

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

        res.json(events[0]);

    } catch (error) {
        console.error("Get event error:", error);

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
            !capacity
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const [result] = await db.query(
            `INSERT INTO events
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
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description,
                category,
                date,
                startTime,
                endTime,
                venue,
                req.user.id,
                capacity,
                image || "",
                "published"
            ]
        );

        res.status(201).json({
            message: "Event created successfully",
            eventId: result.insertId
        });

    } catch (error) {
        console.error("Create event error:", error);

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
        const { id } = req.params;

        const {
            title,
            description,
            category,
            date,
            startTime,
            endTime,
            venue,
            capacity,
            image,
            status
        } = req.body;

        // Check event exists
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

        // Only event organizer or admin can update
        if (
            req.user.role !== "admin" &&
            event.organizerId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You cannot modify this event"
            });
        }

        await db.query(
            `UPDATE events
             SET
                title = ?,
                description = ?,
                category = ?,
                date = ?,
                startTime = ?,
                endTime = ?,
                venue = ?,
                capacity = ?,
                image = ?,
                status = ?
             WHERE id = ?`,
            [
                title,
                description,
                category,
                date,
                startTime,
                endTime,
                venue,
                capacity,
                image || "",
                status || "published",
                id
            ]
        );

        res.json({
            message: "Event updated successfully"
        });

    } catch (error) {
        console.error("Update event error:", error);

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
        const { id } = req.params;

        // Check event exists
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

        // Only organizer or admin can delete
        if (
            req.user.role !== "admin" &&
            event.organizerId !== req.user.id
        ) {
            return res.status(403).json({
                message: "You cannot delete this event"
            });
        }

        await db.query(
            "DELETE FROM events WHERE id = ?",
            [id]
        );

        res.json({
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.error("Delete event error:", error);

        res.status(500).json({
            message: "Failed to delete event"
        });
    }
};


module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};