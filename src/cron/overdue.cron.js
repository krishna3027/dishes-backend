const cron = require("node-cron");
const pool = require("../db");

cron.schedule("0 0 * * *", async () => {
    try {
        const result = await pool.query(`
      UPDATE schedules
      SET status = 'overdue'
      WHERE duty_date < CURRENT_DATE
      AND status = 'assigned'
      RETURNING schedule_id
    `);

        console.log(`[CRON] Overdue updated: ${result.rowCount}`);
    } catch (err) {
        console.error("[CRON ERROR]", err.message);
    }
});
