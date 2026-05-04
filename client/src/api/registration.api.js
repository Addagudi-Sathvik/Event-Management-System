import api from "./axios";

export const registerForEvent = async (eventId) => {
  const { data } = await api.post(`/registrations/${eventId}`);
  return data;
};

export const cancelRegistrationForEvent = async (eventId) => {
  const { data } = await api.delete(`/registrations/${eventId}`);
  return data;
};

export const checkRegistration = async (eventId) => {
  const { data } = await api.get(`/registrations/check/${eventId}`);
  return data;
};

export const getUserRegistrations = async () => {
  const { data } = await api.get('/registrations/my-registrations');
  return data;
};

