module.exports = function toCSV(rows = []) {
  const headers = [
    "Event Name",
    "Attendee Name",
    "Attendee Email",
    "Confirmation Number",
    "Registration Date",
  ];

  const escapeCSV = (value = "") => `"${String(value).replace(/"/g, '""')}"`;

  const lines = rows.map((row) =>
    [
      row.eventName,
      row.attendeeName,
      row.attendeeEmail,
      row.confirmationNumber,
      row.registrationDate,
    ]
      .map(escapeCSV)
      .join(",")
  );

  return [headers.join(","), ...lines].join("\n");
};
