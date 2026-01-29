const pool = require("../db");

async function generateRotation(room_id, startDate, days = 30) {
    const members = await pool.query(
        `SELECT user_id FROM room_members WHERE room_id=$1 ORDER BY joined_at`,
        [room_id]
    );

    if (!members.rows.length) return;

    let index = 0;

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        await pool.query(
            `INSERT INTO schedules (room_id, assigned_user_id, duty_date)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
            [
                room_id,
                members.rows[index].user_id,
                date.toISOString().slice(0, 10),
            ]
        );

        index = (index + 1) % members.rows.length;
    }
}

module.exports = generateRotation;
