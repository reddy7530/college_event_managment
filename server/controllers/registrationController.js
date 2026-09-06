const db = require("../config/db");

// ==========================================
// REGISTER FOR AN EVENT
// POST /api/registrations/:eventId
// ==========================================
const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const studentId = req.user.id;

        // Check whether event exists
        const [events] = await db.query(
            "SELECT * FROM events WHERE id = ?",
            [eventId]
        );

        if (events.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const event = events[0];

        // Check existing registration
        const [existingRegistration] = await db.query(
            `SELECT * FROM registrations
             WHERE studentId = ? AND eventId = ?`,
            [studentId, eventId]
        );

        if (
            existingRegistration.length > 0 &&
            existingRegistration[0].status === "registered"
        ) {
            return res.status(400).json({
                message: "You are already registered for this event"
            });
        }

        // Count currently registered students
        const [countResult] = await db.query(
            `SELECT COUNT(*) AS registeredCount
             FROM registrations
             WHERE eventId = ? AND status = 'registered'`,
            [eventId]
        );

        const registeredCount = countResult[0].registeredCount;

        // Check event capacity
        if (registeredCount >= event.capacity) {
            return res.status(400).json({
                message: "Event capacity is full"
            });
        }

        // If previous registration was cancelled, reactivate it
        if (existingRegistration.length > 0) {
            await db.query(
                `UPDATE registrations
                 SET status = 'registered',
                     registeredAt = NOW(),
                     updatedAt = NOW()
                 WHERE id = ?`,
                [existingRegistration[0].id]
            );

            return res.json({
                message: "Registration successful"
            });
        }

        // Create new registration
        await db.query(
            `INSERT INTO registrations
             (
                 studentId,
                 eventId,
                 status,
                 registeredAt,
                 createdAt,
                 updatedAt
             )
             VALUES (?, ?, 'registered', NOW(), NOW(), NOW())`,
            [studentId, eventId]
        );

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Failed to register for event"
        });
    }
};


// ==========================================
// GET MY REGISTRATIONS
// GET /api/registrations/my
// ==========================================
const getMyRegistrations = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [registrations] = await db.query(
            `SELECT
                r.id,
                r.eventId,
                r.status,
                r.registeredAt,
                e.title,
                e.description,
                e.category,
                e.date,
                e.startTime,
                e.endTime,
                e.venue,
                e.capacity
             FROM registrations r
             JOIN events e
                 ON r.eventId = e.id
             WHERE r.studentId = ?
             ORDER BY e.date ASC, e.startTime ASC`,
            [studentId]
        );

        res.json(registrations);

    } catch (error) {
        console.error("Get registrations error:", error);

        res.status(500).json({
            message: "Failed to fetch registrations"
        });
    }
};


// ==========================================
// CANCEL REGISTRATION
// DELETE /api/registrations/:eventId
// ==========================================
const cancelRegistration = async (req, res) => {
    try {
        const { eventId } = req.params;
        const studentId = req.user.id;

        const [registrations] = await db.query(
            `SELECT * FROM registrations
             WHERE studentId = ? AND eventId = ?`,
            [studentId, eventId]
        );

        if (registrations.length === 0) {
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        if (registrations[0].status === "cancelled") {
            return res.status(400).json({
                message: "Registration is already cancelled"
            });
        }

        await db.query(
            `UPDATE registrations
             SET status = 'cancelled',
                 updatedAt = NOW()
             WHERE studentId = ? AND eventId = ?`,
            [studentId, eventId]
        );

        res.json({
            message: "Registration cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel registration error:", error);

        res.status(500).json({
            message: "Failed to cancel registration"
        });
    }
};


module.exports = {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration
};