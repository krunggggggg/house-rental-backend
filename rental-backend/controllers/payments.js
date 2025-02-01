const Payment = require("../models/Payment");

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

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.getAll();
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
