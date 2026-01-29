const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth.middleware");
const notifyUsers = require("../utils/notify");

/**
 * CREATE DISHWASHING SCHEDULE
 * - Creates schedule
 * - Notifies all room members
 */
router.post("/", auth, async (req, res) => {
    try {
        const { room_id, assigned_user_id, duty_date } = req.body;

        // Create schedule
        const schedule = await pool.query(
            `INSERT INTO schedules (room_id, assigned_user_id, duty_date)
       VALUES ($1,$2,$3)
       RETURNING *`,
            [room_id, assigned_user_id, duty_date]
        );

        // Fetch room members
        const members = await pool.query(
            `SELECT user_id FROM room_members WHERE room_id=$1`,
            [room_id]
        );

        // Notify all members
        await notifyUsers(
            members.rows.map(r => r.user_id),
            `Dishwashing assigned for ${duty_date}`
        );

        res.json(schedule.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to create schedule" });
    }
});

/**
 * MARK DISHWASHING AS COMPLETED
 * - Changes status to pending_verification
 * - Notifies peers for verification
 */
router.post("/:id/complete", auth, async (req, res) => {
    try {
        const scheduleId = req.params.id;

        // Update schedule status
        const result = await pool.query(
            `UPDATE schedules
       SET status='pending_verification'
       WHERE schedule_id=$1 AND assigned_user_id=$2
       RETURNING room_id`,
            [scheduleId, req.user.user_id]
        );

        if (!result.rowCount) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const roomId = result.rows[0].room_id;

        // Fetch room members
        const members = await pool.query(
            `SELECT user_id FROM room_members WHERE room_id=$1`,
            [roomId]
        );

        // Notify members
        await notifyUsers(
            members.rows.map(r => r.user_id),
            "Dishwashing marked complete. Please verify."
        );

        res.json({ message: "Marked as completed, waiting verification" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to mark completion" });
    }
});

module.exports = router;
