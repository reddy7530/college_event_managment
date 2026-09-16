const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==========================================
// REGISTER
// POST /api/auth/register
// ==========================================
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            college,
            department,
            year
        } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        // Basic password validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check if email already exists
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        /*
         * SECURITY:
         * Public registration always creates a student.
         *
         * Do NOT accept role from req.body.
         * Users cannot register themselves as organizer/admin.
         */
        const role = "student";

        // Insert user
        const [result] = await db.query(
            `INSERT INTO users
            (
                name,
                email,
                password,
                role,
                college,
                department,
                year,
                createdAt,
                updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                name,
                email,
                hashedPassword,
                role,
                college || "",
                department || "",
                year || ""
            ]
        );

        res.status(201).json({
            message: "Registration successful",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Register error:", error);

        // Do not expose internal/database errors
        res.status(500).json({
            message: "Registration failed. Please try again later."
        });
    }
};


// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================
const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                department: user.department,
                year: user.year
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
};


// ==========================================
// GET PROFILE
// GET /api/auth/profile
// ==========================================
// GET /api/auth/profile
const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT
                id,
                name,
                email,
                role,
                college,
                department,
                year,
                createdAt,
                updatedAt
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(users[0]);

    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};


module.exports = {
    register,
    login,
    getProfile
};