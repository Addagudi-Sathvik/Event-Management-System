import api from "./axios";

export const verifyTicketApi = async (qrToken) => {
  const { data } = await api.post("/tickets/verify", { qrToken });
  return data;
};
