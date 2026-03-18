import nodemailer from "nodemailer";
// import 'dotenv/config';

// Configuring transporter
const createTransporter = async () => {
  if (!process.env.EMAIL_USER) {
    // Creating a temporary Ethereal test account automatically to preview in browser in case  (as seen in a video)
    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      }),
      isTest: true,
    };
  }

  // Using the real credentials from .env
  return {
    transporter: nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }),
    isTest: false,
  };
};

// The main function - sends a confirmation email with the ticket details
export const sendConfirmationEmail = async ({ to, name, event, ticketCode, qrCode }) => {
  const { transporter, isTest } = await createTransporter();

  // Format the date nicely e.g. "Friday, March 13, 2026"
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Simple HTML email template
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: #4f46e5; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">You're Registered!</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; color: #374151;">Hi <strong>${name}</strong>,</p>
        <p style="color: #6b7280;">Your registration is confirmed. Here are your details:</p>

        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin: 0 0 12px; color: #111827;">${event.title}</h2>
          <p style="margin: 6px 0; color: #374151;"><strong>Date:</strong> ${eventDate}</p>
          <p style="margin: 6px 0; color: #374151;"><strong>Location:</strong> ${event.location}</p>
          <p style="margin: 6px 0; color: #374151;"><strong>Price:</strong> ${event.price === 0 ? "Free" : "₦" + event.price}</p>
        </div>

        <div style="background: #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your Ticket Code</p>
          <p style="color: white; font-size: 28px; font-weight: bold; font-family: monospace; letter-spacing: 3px; margin: 0;">${ticketCode}</p>
        </div>

        ${qrCode ? `
        <div style="text-align: center; margin: 20px 0;">
          <img src="cid:qrcode" width="150" height="150" style="border: 4px solid #4f46e5; border-radius: 8px;" />
          <p style="color: #9ca3af; font-size: 13px;">Scan this QR code at the entrance</p>
        </div>` : ""}

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #92400e;">
            Your ticket can only be used once. Don't share it with anyone else.
          </p>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 13px;">
        <p>Questions? Email the organizer: <strong><a href="mailto:${event.organizerEmail}">${event.organizerEmail}</a></strong></p>
      </div>

    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Event App" <noreply@eventapp.com>',
    to,
    subject: `Your ticket for ${event.title}`,
    html,
    attachments: [
    {
      filename: "ticket-qrcode.png",
      content: qrCode.split("base64,")[1], // strip the data:image/png;base64, part
      encoding: "base64",
      cid: "qrcode", // content ID - used to reference it in the HTML
    },
  ],
  });

  // If using Ethereal, return the preview URL so we can see the email
  if (isTest) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`Email preview link: ${previewUrl}`);
    return { previewUrl };
  }

  return {};
};
