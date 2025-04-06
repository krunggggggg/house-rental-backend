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
      ),
      resolved_payments AS (
        SELECT 
          rp.tenant_id,
          MAX(rp.payment_end_date) AS last_payment_date,
          rp.is_paid
        FROM rent_payments rp
        WHERE rp.is_paid = TRUE
        GROUP BY rp.tenant_id, rp.is_paid
      ),
      adjusted_due_dates AS (
        SELECT 
          d.tenant_id,
          d.full_name,
          d.monthly_rent,
          d.current_due_date,
          rp.last_payment_date,
          rp.is_paid,
          CASE 
            -- If the tenant has a resolved payment for the current due date, calculate the next due date
            WHEN rp.last_payment_date IS NOT NULL AND EXTRACT(DAY FROM rp.last_payment_date) = EXTRACT(DAY FROM d.current_due_date) THEN 
              (rp.last_payment_date + INTERVAL '1 month')::DATE
            ELSE d.current_due_date
          END AS adjusted_due_date
        FROM due_dates d
        LEFT JOIN resolved_payments rp ON d.tenant_id = rp.tenant_id
      )
      SELECT 
        (SELECT COUNT(*) FROM tenants WHERE is_active = TRUE) as "totalTenants",
        (SELECT SUM(monthly_rent) FROM tenants WHERE is_active = TRUE) as "monthlyProjection",
        COALESCE(
          json_agg(
            json_build_object(
              'tenant_id', a.tenant_id,
              'full_name', a.full_name,
              'monthly_rent', a.monthly_rent,
              'due_date', TO_CHAR(a.adjusted_due_date, 'YYYY-MM-DD'),
              'days_diff', 
                CASE 
                  WHEN CURRENT_DATE > a.adjusted_due_date 
                  THEN CURRENT_DATE - a.adjusted_due_date 
                  ELSE a.adjusted_due_date - CURRENT_DATE 
                END,
              'status', 
                CASE 
                  WHEN CURRENT_DATE > a.adjusted_due_date THEN 'overdue'
                  WHEN a.adjusted_due_date - CURRENT_DATE <= 5 THEN 'upcoming'
                  ELSE 'current'
                END,
              'is_paid', 
                CASE 
                  WHEN a.is_paid = TRUE AND EXTRACT(DAY FROM a.last_payment_date) = EXTRACT(DAY FROM a.current_due_date) THEN TRUE
                  ELSE FALSE
                END,
              'debug_info', 
                json_build_object(
                  'current_due_date', TO_CHAR(a.current_due_date, 'YYYY-MM-DD'),
                  'last_payment_date', TO_CHAR(a.last_payment_date, 'YYYY-MM-DD'),
                  'adjusted_due_date', TO_CHAR(a.adjusted_due_date, 'YYYY-MM-DD')
                )
            ) 
            ORDER BY a.adjusted_due_date
          ),
          '[]'::JSON
        ) as "upcomingDueDates"
      FROM adjusted_due_dates a;
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
