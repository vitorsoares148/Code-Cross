import api from "./axios";

export async function getUserInfo() {
  const response = await api.get(`/user/info`);

  return response.data;
}
