const pool = require("../config/db");

exports.getMetrics = async (req, res) => {
  try {
    const today = new Date();
    const currentDay = today.getDate();
    const nextWeekDay = new Date(today);
    nextWeekDay.setDate(today.getDate() + 7);
    const maxDueDate = nextWeekDay.getDate();

    const metrics = await Promise.all([
      pool.query(
        `SELECT COUNT(tenant_id) AS count FROM tenants WHERE is_active = true`
      ),

      pool.query(
        `SELECT SUM(monthly_rent) AS total FROM tenants WHERE is_active = true`
      ),

      pool.query(
        `SELECT full_name, due_date, monthly_rent 
         FROM tenants 
         WHERE due_date BETWEEN $1 AND $2`,
        [currentDay, maxDueDate]
      ),
    ]);

    res.json({
      totalTenants: metrics[0].rows[0].count,
      monthlyProjection: metrics[1].rows[0].total,
      upcomingDueDates: metrics[2].rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
