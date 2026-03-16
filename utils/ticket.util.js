import QRCode from "qrcode";


// Generates a readable ticket code like "AB12-CD34-EF56"
export const generateTicketCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += "-"; // add dashes for readability
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};


// Generates a QR code image (as a base64 string) that links to the validation page
export const generateQRCode = async (ticketCode) => {
  const url = `${process.env.BASE_URL || "http://localhost:5000"}/api/tickets/validate/${ticketCode}`;
  const qrDataUrl = await QRCode.toDataURL(url, { width: 250, margin: 2 });
  return qrDataUrl;
};