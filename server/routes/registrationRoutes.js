const express = require("express");

const {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration
} = require("../controllers/registrationController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// Register for event
router.post(
    "/:eventId",
    authenticateToken,
    registerForEvent
);


// Get logged-in student's registrations
router.get(
    "/my",
    authenticateToken,
    getMyRegistrations
);


// Cancel registration
router.delete(
    "/:eventId",
    authenticateToken,
    cancelRegistration
);


module.exports = router;