import api from "./axios";

export const verifyTicketApi = async (token) => {
  const { data } = await api.post("/tickets/verify", { token });
  return data;
};
