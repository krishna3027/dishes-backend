const express = require("express");
const cors = require('cors')
require("dotenv").config();

require("./cron/overdue.cron");



const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))


app.use("/auth", require("./routes/auth.routes"));
app.use("/rooms", require("./routes/room.routes"));
app.use("/schedules", require("./routes/schedule.routes"));
app.use("/verify", require("./routes/verification.routes"));
app.use("/rotation", require("./routes/rotation.routes"));
app.use("/notifications", require("./utils/notify"));
// app.use("/notifications", require("./routes/notification.routes"));

module.exports = app;


app.get("/health/db", async (req, res) => {
    const pool = require("./db");
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            status: "ok",
            db_time: result.rows[0],
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            error: err.message,
        });
    }
});
