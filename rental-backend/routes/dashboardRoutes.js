const express = require("express");
const router = express.Router();
const { getMetrics } = require("../controllers/dashboard");

router.get("/metrics", getMetrics);

module.exports = router;
