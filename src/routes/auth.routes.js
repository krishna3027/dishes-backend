const router = require("express").Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const { name, email, role } = req.body;

    const result = await pool.query(
        `INSERT INTO users (name, email, role)
     VALUES ($1,$2,$3) RETURNING *`,
        [name, email, role]
    );

    res.json(result.rows[0]);
});

router.post("/login", async (req, res) => {
    const { email } = req.body;

    const user = await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [email]
    );

    if (!user.rows.length)
        return res.status(404).json({ message: "User not found" });

    const token = jwt.sign(
        { user_id: user.rows[0].user_id, role: user.rows[0].role },
        process.env.JWT_SECRET
    );

    res.json({ token });
});

module.exports = router;
