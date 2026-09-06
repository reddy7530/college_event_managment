const express = require("express");
const cors = require("cors");
const path = require("path");

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
   TEST ROUTES
========================= */

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../client/dist/index.html")
    );
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

/* =========================
   SERVE REACT FRONTEND
========================= */

app.use(
    express.static(
        path.join(__dirname, "../client/dist")
    )
);

/* =========================
   REACT ROUTING
========================= */

app.use((req, res) => {
    res.sendFile(
        path.join(__dirname, "../client/dist/index.html")
    );
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});