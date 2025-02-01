const express = require("express");
const router = express.Router(); // This line was missing
const {
  createTenant,
  getAllTenants,
  updateTenant,
  deleteTenant,
  getTenantById,
} = require("../controllers/tenants");

// Define routes
router.post("/", createTenant);
router.get("/", getAllTenants);
router.put("/:id", updateTenant);
router.delete("/:id", deleteTenant);
router.get("/:id", getTenantById);
// router.get("/", async (req, res) => {
//   try {
//     const filters = {
//       search: req.query.search,
//       active: req.query.active,
//       sortBy: req.query.sortBy,
//       sortOrder: req.query.sortOrder,
//     };

//     const tenants = await Tenant.getAll(filters);
//     res.json({ tenants });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
