const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const Payment = {
  create: async (tenantId, paymentData) => {
    const paymentId = uuidv4();

    const paymentStartDate =
      paymentData.payment_start_date || new Date().toISOString().split("T")[0];
    const paymentEndDate =
      paymentData.payment_end_date ||
      new Date(
        new Date(paymentStartDate).setMonth(
          new Date(paymentStartDate).getMonth() + 1
        )
      )
        .toISOString()
        .split("T")[0];

    const { rows } = await db.query(
      `INSERT INTO rent_payments (
        payment_id,
        tenant_id,
        amount_paid,
        payment_start_date,
        payment_end_date,
        is_paid
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        paymentId,
        tenantId,
        paymentData.amount_paid,
        paymentStartDate,
        paymentEndDate,
        paymentData.is_paid || false,
      ]
    );
    return rows[0];
  },

  getByTenant: async (tenantId) => {
    const { rows } = await db.query(
      `SELECT * FROM rent_payments 
       WHERE tenant_id = $1
       ORDER BY payment_start_date DESC`,
      [tenantId]
    );

    return rows;
  },

  getAll: async () => {
    const { rows } = await db.query(
      `SELECT p.*, t.full_name, t.is_active, t.unit_number 
       FROM rent_payments p
       JOIN tenants t ON p.tenant_id = t.tenant_id`
    );
    return rows;
  },
};

module.exports = Payment;
