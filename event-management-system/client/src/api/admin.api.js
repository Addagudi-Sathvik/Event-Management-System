import api from "./axios";

// Dashboard
export const getAdminStats = () => api.get("/admin/stats");

// Events
export const getPendingEvents = () => api.get("/admin/pending-events");
export const approveEvent = (eventId) => api.patch(`/admin/events/${eventId}/approve`);
export const rejectEvent = (eventId, reason) => api.patch(`/admin/events/${eventId}/reject`, { reason });
export const getAllEvents = () => api.get("/admin/events"); // Will add backend if needed
export const deleteEvent = (eventId) => api.delete(`/admin/events/${eventId}`);

// Users
export const getAllUsers = () => api.get("/admin/users");
export const blockUser = (userId) => api.put(`/admin/users/${userId}/block`);
export const unblockUser = (userId) => api.put(`/admin/users/${userId}/unblock`);

// Utils
export const refreshPendingEvents = () => getPendingEvents();

