const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth.middleware");
const notifyUsers = require("../utils/notify");

/**
 * VERIFY DISHWASHING
 * - Peer verification
 * - Requires 2 unique verifications
 * - Final completion notification
 */
router.post("/:scheduleId", auth, async (req, res) => {
    try {
        const scheduleId = req.params.scheduleId;

        // Fetch schedule
        const scheduleRes = await pool.query(
            `SELECT * FROM schedules WHERE schedule_id=$1`,
            [scheduleId]
        );

        if (!scheduleRes.rows.length) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        const schedule = scheduleRes.rows[0];

        // Prevent self-verification
        if (schedule.assigned_user_id === req.user.user_id) {
            return res.status(403).json({ message: "Cannot verify yourself" });
        }

        // Insert verification
        await pool.query(
            `INSERT INTO verifications (schedule_id, verifier_user_id)
       VALUES ($1,$2)`,
            [scheduleId, req.user.user_id]
        );

        // Count verifications
        const countRes = await pool.query(
            `SELECT COUNT(*) FROM verifications WHERE schedule_id=$1`,
            [scheduleId]
        );

        const verificationCount = parseInt(countRes.rows[0].count);

        // If verified by 2 peers → complete task
        if (verificationCount >= 2) {
            await pool.query(
                `UPDATE schedules
         SET status='completed', completed_at=NOW()
         WHERE schedule_id=$1`,
                [scheduleId]
            );

            // Fetch room members
            const members = await pool.query(
                `SELECT user_id FROM room_members WHERE room_id=$1`,
                [schedule.room_id]
            );

            // Notify final completion
            await notifyUsers(
                members.rows.map(r => r.user_id),
                "Dishwashing verified and completed ✅"
            );
        }

        res.json({ message: "Verification recorded" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Verification failed" });
    }
});

module.exports = router;
