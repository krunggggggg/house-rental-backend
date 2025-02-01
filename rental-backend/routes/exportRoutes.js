const express = require("express");
const router = express.Router();
const { exportTenants } = require("../controllers/export");

router.get("/tenants", exportTenants);

module.exports = router;
