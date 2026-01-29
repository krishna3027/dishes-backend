const pool = require("../db");

async function notifyUsers(userIds, message) {
    if (!userIds) return;

    // Normalize to array (handles single ID or array of IDs)
    const ids = Array.isArray(userIds) ? userIds : [userIds];

    for (const userId of ids) {
        await pool.query(
            `INSERT INTO notifications (user_id, message)
             VALUES ($1, $2)`,
            [userId, message]
        );
    }
}

module.exports = notifyUsers;
