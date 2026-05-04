const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

exports.sendRegistrationEmail = async ({
  to,
  attendeeName,
  eventName,
  eventDate,
  eventVenue,
  qrCodeData,
}) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) return;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="color:#10b981">Registration Confirmed</h2>
      <p>Hi ${attendeeName}, your seat is confirmed.</p>
      <ul>
        <li><strong>Event:</strong> ${eventName}</li>
        <li><strong>Date:</strong> ${new Date(eventDate).toLocaleString()}</li>
        <li><strong>Venue:</strong> ${eventVenue}</li>
      </ul>
      <p>Show this QR at check-in:</p>
      <img alt="ticket-qr" src="${qrCodeData}" width="220" height="220" />
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Your Ticket: ${eventName}`,
    html,
  });
};

exports.sendEventReminderEmail = async ({ to, attendeeName, eventName, eventDate, eventVenue }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) return;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="color:#6366f1">Event Reminder</h2>
      <p>Hi ${attendeeName}, your event starts in about 24 hours.</p>
      <ul>
        <li><strong>Event:</strong> ${eventName}</li>
        <li><strong>Date:</strong> ${new Date(eventDate).toLocaleString()}</li>
        <li><strong>Venue:</strong> ${eventVenue}</li>
      </ul>
      <p>See you there!</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Reminder: ${eventName} is tomorrow`,
    html,
  });
};
