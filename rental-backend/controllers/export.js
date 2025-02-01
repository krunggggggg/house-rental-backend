const pool = require("../config/db");

exports.exportTenants = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        full_name AS "Full Name",
        contact_number AS "Contact Number",
        email AS "Email",
        monthly_rent AS "Monthly Rent",
        due_date AS "Due Date",
        number_of_occupants AS "Occupants",
        contract_start_date AS "Contract Start"
      FROM tenants
    `);

    const csvContent = [
      Object.keys(rows[0]).join(","),
      ...rows.map((row) => Object.values(row).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=tenants.csv");
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
