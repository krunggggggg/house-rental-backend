import express from "express";
const router = express.Router();
import { downloadReceipt } from "../controllers/receipts";

router.get("/:paymentId", downloadReceipt);

export default router;
