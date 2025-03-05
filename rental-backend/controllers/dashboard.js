const pool = require("../config/db");

exports.getMetrics = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH due_dates AS (
        SELECT 
          t.tenant_id,
          t.full_name,
          t.monthly_rent,
          -- Calculate current due date ensuring it's at least 1 month after contract start
          GREATEST(
            (DATE_TRUNC('month', CURRENT_DATE) + 
            (EXTRACT(DAY FROM t.contract_start_date) - 1) * INTERVAL '1 day')::DATE,
            t.contract_start_date + INTERVAL '1 month'
          )::DATE AS current_due_date
        FROM tenants t
        WHERE t.is_active = TRUE
      )
      SELECT 
        (SELECT COUNT(*) FROM tenants WHERE is_active = TRUE) as "totalTenants",
        (SELECT SUM(monthly_rent) FROM tenants WHERE is_active = TRUE) as "monthlyProjection",
        COALESCE(
          json_agg(
            json_build_object(
              'tenant_id', d.tenant_id,
              'full_name', d.full_name,
              'monthly_rent', d.monthly_rent,
              'due_date', TO_CHAR(d.current_due_date, 'YYYY-MM-DD'),
              'days_diff', 
                CASE 
                  WHEN CURRENT_DATE > d.current_due_date 
                  THEN CURRENT_DATE - d.current_due_date 
                  ELSE d.current_due_date - CURRENT_DATE 
                END,
              'status', 
                CASE 
                  WHEN CURRENT_DATE > d.current_due_date THEN 'overdue'
                  WHEN d.current_due_date - CURRENT_DATE <= 5 THEN 'upcoming'
                  ELSE 'current'
                END
            ) 
            ORDER BY d.current_due_date
          ),
          '[]'::JSON
        ) as "upcomingDueDates"
      FROM due_dates d;
    `);

    res.json({
      success: true,
      dashboard: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
