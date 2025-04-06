const Payment = require("../models/Payment");
const pool = require("../config/db");

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.params.tenantId, req.body);
    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get payments by tenant ID
exports.getPaymentsByTenant = async (req, res) => {
  try {
    const payments = await Payment.getByTenant(req.params.tenantId);
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  const { tenantId } = req.params;
  try {
    // Query the database for payments
    const { rows } = await pool.query(
      `SELECT * FROM rent_payments 
       WHERE tenant_id = $1
       ORDER BY payment_start_date DESC`,
      [tenantId]
    );
    // Return the payments directly in the "payments" key
    return res.status(200).json({ payments: rows }); // Use "payments" key
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Failed to fetch payments." });
  }
};
