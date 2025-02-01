import PDFDocument from "pdfkit";
import pool from "../config/db";

const generateReceipt = async (paymentId) => {
  const { rows } = await pool.query(
    `
    SELECT p.*, t.full_name, t.address, t.monthly_rent
    FROM rent_payments p
    JOIN tenants t ON p.tenant_id = t.tenant_id
    WHERE p.payment_id = $1
  `,
    [paymentId]
  );

  if (rows.length === 0) throw new Error("Payment not found");

  const doc = new PDFDocument();
  const buffers = [];

  doc.pipe({ write: (chunk) => buffers.push(chunk) });

  doc.fontSize(20).text("Rent Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Tenant: ${rows[0].full_name}`);
  doc.text(`Address: ${rows[0].address}`);
  doc.moveDown();

  doc.font("Helvetica-Bold").text("Payment Details:");
  doc
    .font("Helvetica")
    .text(`Amount: ₱${rows[0].amount_pid}`)
    .text(
      `Payment Date: ${new Date(rows[0].payment_date).toLocaleDateString()}`
    )
    .text(
      `Month Covered: ${new Date(rows[0].payment_date).toLocaleString(
        "default",
        { month: "long" }
      )}`
    );

  doc.end();

  return Buffer.concat(buffers);
};

exports.downloadReceipt = async (req, res) => {
  try {
    const pdfBuffer = await generateReceipt(req.params.paymentId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${req.params.paymentId}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
