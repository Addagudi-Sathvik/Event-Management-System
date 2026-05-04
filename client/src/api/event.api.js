import api from "./axios";

export const getUpcomingEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

export const getEventById = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

export const createEventApi = async (payload) => {
  const { data } = await api.post("/events", payload);
  return data;
};

export const submitEventFeedback = async (eventId, payload) => {
  const { data } = await api.post(`/events/${eventId}/feedback`, payload);
  return data;
};

export const getEventSentimentSummary = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/sentiment-summary`);
  return data;
};
