const express = require("express");
const router = express.Router();
const {
  createPayment,
  getPaymentsByTenant,
  getAllPayments,
} = require("../controllers/payments");

router.post("/:tenantId", createPayment);
router.get("/:tenantId", getPaymentsByTenant);
router.get("/", getAllPayments);

module.exports = router;
