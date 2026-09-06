const express = require("express");

const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// Public routes

router.get("/", getAllEvents);

router.get("/:id", getEventById);


// Organizer/Admin routes

router.post(
    "/",
    authenticateToken,
    authorizeRoles("organizer", "admin"),
    createEvent
);


router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("organizer", "admin"),
    updateEvent
);


router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("organizer", "admin"),
    deleteEvent
);


module.exports = router;