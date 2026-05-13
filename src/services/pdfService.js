const PDFDocument = require("pdfkit");

exports.generateTicket = (booking) => {
  const doc = new PDFDocument();

  doc.fontSize(18).text("✈ SkyBook+ E-Ticket", { align: "center" });

  doc.moveDown();
  doc.text(`Booking ID: ${booking._id}`);
  doc.text(`Flight: ${booking.flight}`);
  doc.text(`Seats: ${booking.seats.join(", ")}`);
  doc.text(`Status: ${booking.status}`);

  doc.end();
  return doc;
};