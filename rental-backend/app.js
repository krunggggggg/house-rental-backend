const express = require("express");
const cors = require("cors");
const app = express();
const tenantRoutes = require("./routes/tenantRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const exportRoutes = require("./routes/exportRoutes");
const receiptRoutes = require("./routes/exportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
require("./utils/scheduler");
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tenants", tenantRoutes);

// Add after other routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
