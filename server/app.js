const express = require("express");
const cors = require("cors");

require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

/* =========================
   API TEST
========================= */

app.get("/", (req, res) => {
    res.json({
        message: "College Event Portal API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT 1 AS result"
        );

        res.json({
            message: "MySQL connection successful",
            data: rows
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

module.exports = app;