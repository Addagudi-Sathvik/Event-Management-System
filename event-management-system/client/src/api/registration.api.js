import api from "./axios";

export const registerForEvent = async (eventId) => {
  const { data } = await api.post(`/registrations/${eventId}`);
  return data;
};

export const cancelRegistrationForEvent = async (eventId) => {
  const { data } = await api.delete(`/registrations/${eventId}`);
  return data;
};
