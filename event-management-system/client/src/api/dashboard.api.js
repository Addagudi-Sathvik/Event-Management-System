import api from "./axios";

export const getOrganizerStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data;
};

export const getEventAttendees = async (eventId) => {
  const { data } = await api.get(`/dashboard/events/${eventId}/attendees`);
  return data;
};

export const exportAttendeesCSV = async (eventId) => {
  const response = await api.get(`/dashboard/events/${eventId}/attendees/export`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `attendees-${eventId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getOrganizerAnalytics = async () => {
  const { data } = await api.get("/dashboard/analytics");
  return data;
};
