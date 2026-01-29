const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, async (req, res) => {
    const { room_name } = req.body;

    const room = await pool.query(
        `INSERT INTO rooms (room_name, admin_id)
     VALUES ($1,$2) RETURNING *`,
        [room_name, req.user.user_id]
    );

    await pool.query(
        `INSERT INTO room_members (room_id, user_id)
     VALUES ($1,$2)`,
        [room.rows[0].room_id, req.user.user_id]
    );

    res.json(room.rows[0]);
});

router.post("/:roomId/add-member", auth, async (req, res) => {
    const { user_id } = req.body;

    await pool.query(
        `INSERT INTO room_members (room_id, user_id)
     VALUES ($1,$2)`,
        [req.params.roomId, user_id]
    );

    res.json({ message: "Member added" });
});

module.exports = router;
